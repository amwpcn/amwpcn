import {
  ConcurrencyManager,
  ConcurrencyManagerOptions,
  Graph,
  GraphNode,
  GraphOptions,
} from './helpers';
import { IContext, IHandlers, ImmutableContext } from './immutable-context';
import {
  dequeueAfter,
  dequeueBefore,
  isAfterEmpty,
  isBeforeEmpty,
  Step,
  stepId,
} from './step';

type StepStage = 'execute' | 'prepare' | 'final';
type ErrorHandler = (error: unknown, stepName: string) => boolean;

interface ErrorHandlers {
  execute?: ErrorHandler;
  prepare?: ErrorHandler;
  final?: ErrorHandler;
}

interface Options {
  graph?: GraphOptions;
  maxRepetitions?: number;
  concurrency?: ConcurrencyManagerOptions;
}

/**
 * Class representing a StepExecutor that asynchronously starts the execution of provided steps concurrently.
 * Handles preparation, before queue execution, current step execution, after queue execution, and finalization of all steps.
 * Stops execution if an immediate stop is requested or an error occurs.
 *
 * @param s - The step or array of steps to be executed.
 * @param c - The context object for the steps.
 * @param _errorHandlers - (Optional) The error handlers for handling errors during step execution.
 * @param _options - (Optional) The options for configuring the StepExecutor.
 */
export class StepExecutor<C extends IContext> {
  private readonly _MAX_REPETITIONS = 10;

  private readonly _steps: Step<C>[];
  private readonly _maxRepetitions: number;
  private readonly _graph: Graph;
  private readonly _concurrencyManager: ConcurrencyManager;
  private _context: ImmutableContext<C>;

  private _stopImmediate: boolean = false;
  private _handlers: IHandlers<C> = {
    stopImmediate: () => {
      this._stopImmediate = true;
    },
    contextUpdater: (updater) => {
      this._context = this._context.update(updater);
    },
  };

  constructor(
    s: Step<C> | Step<C>[],
    c: C,
    private _errorHandlers?: ErrorHandlers,
    options?: Options,
  ) {
    this._steps = Array.isArray(s) ? s : [s];
    this._context = new ImmutableContext(c);
    this._maxRepetitions = options?.maxRepetitions ?? this._MAX_REPETITIONS;
    this._graph = new Graph(options?.graph);
    this._concurrencyManager = new ConcurrencyManager(options?.concurrency);
  }

  get graphData() {
    return this._graph.data;
  }

  /**
   * Asynchronously starts the execution of all provided steps concurrently.
   * It handles preparation, before queue execution, current step execution,
   * after queue execution, and finalization of all the steps.
   * Stops execution if an immediate stop is requested or an error occurs.
   * But the steps that are executed in parallel might still be executed till the end
   *
   * @returns A Promise that resolves when all step executions are completed.
   */
  async start(): Promise<void> {
    // All the provided steps will start executing concurrently
    await Promise.all([...this._steps.map((s) => this._start(s))]);
  }

  /**
   * Asynchronously starts the execution of a step.
   * Handles preparation, before queue execution, current step execution, after queue execution, and finalization.
   * Stops execution if an immediate stop is requested or an error occurs.
   *
   * @param step - The step to be executed.
   * @param previous - The previous step that leads to the current step.
   * @param ancestors - An array of step names representing the ancestors of the current step.
   * @returns A Promise that resolves when the step and its related steps are executed.
   */
  private async _start(
    step: Step<C>,
    previous?: Step<C>,
    ancestors?: string[],
  ): Promise<void> {
    // Validate circular dependency
    const currentAncestors = ancestors ? [...ancestors, step.name] : [];
    this._checkRepetitions(currentAncestors, step.name);

    // Creates a new node for the current step and links it to the previous one
    if (this._graph.enabled) {
      this._updateGraph(step, previous);
    }

    // If any step other requested an immediate stop
    if (this._stopImmediate) {
      return;
    }

    // Preparations
    try {
      await step.prepare(this._context.get());
    } catch (error) {
      if (this._defaultErrorHandler(error, step.name, 'prepare')) {
        return;
      }
    }

    // Executing before queue recursively
    while (!isBeforeEmpty(step)) {
      const steps = dequeueBefore(step);
      await Promise.all([
        ...steps.map((s) => this._start(s, step, currentAncestors)),
      ]);

      // Before executions always comes back to the current step, hence we add the coming back edge to  the graph
      if (this._graph.enabled)
        for (const s of steps) this._updateGraph(step, s);

      // If any before step of the current step or highest priority step requested an immediate stop
      if (this._stopImmediate) {
        return;
      }
    }

    // Executing the current step
    const immediateSteps: Step<C>[] = [];
    try {
      await this._concurrencyManager.acquire();
      const result = await step.execute(this._context.get(), this._handlers);

      if (result) {
        immediateSteps.push(...(Array.isArray(result) ? result : [result]));
      }
    } catch (error) {
      if (this._defaultErrorHandler(error, step.name, 'execute')) {
        await step.rollback(this._context.get(), this._handlers);
        return;
      }
    } finally {
      this._concurrencyManager.release();
    }

    // Immediate steps returned by the current execute function should be executed immediately
    // even before the after queue steps.
    await Promise.all(
      immediateSteps.map((s) => this._start(s, step, currentAncestors)),
    );

    // Executing after queue recursively
    while (!isAfterEmpty(step)) {
      const steps = dequeueAfter(step);
      await Promise.all([
        ...steps.map((s) => this._start(s, step, currentAncestors)),
      ]);

      // If any highest priority step requested an immediate stop
      if (this._stopImmediate) {
        return;
      }
    }

    // Wrapping up with final
    try {
      await step.final(this._context.get());
    } catch (error) {
      if (this._defaultErrorHandler(error, step.name, 'final')) {
        return;
      }
    }
  }

  private _checkRepetitions(
    ancestors: string[],
    stepName: string,
  ): void | never {
    const occurrences = ancestors.reduce(
      (a, v) => (v === stepName ? a + 1 : a),
      0,
    );

    if (occurrences > this._maxRepetitions) {
      throw new Error(
        `Step "${stepName}" has been repeated ${occurrences} times, which exceeds the maximum allowed repetition of ${this._maxRepetitions}.
        You can increase this amount in StepExecutor options at your own risk of circular dependency.`,
      );
    }
  }

  private _updateGraph(current: Step<C>, previous?: Step<C>): GraphNode {
    const currentNode = this._graph.addNode({
      id: stepId(current),
      label: current.name,
    });

    if (previous) {
      this._graph.addEdge({
        from: stepId(previous),
        to: stepId(current),
        arrows: 'to',
        smooth: { type: 'curvedCW', roundness: 0.2 },
      });
    }

    return currentNode;
  }

  private _defaultErrorHandler(
    error: unknown,
    stepName: string,
    stage: StepStage,
  ): boolean {
    const fn = this._errorHandlers?.[stage];
    if (fn) {
      return fn(error, stepName);
    }

    console.error({ stepName, stage, error });
    this._handlers.stopImmediate();
    return true;
  }
}

export function createExecutor<C extends IContext>(
  s: Step<C> | Step<C>[],
  c: C,
  errorHandlers?: ErrorHandlers,
  options?: Options,
) {
  return new StepExecutor(s, c, errorHandlers, options);
}
