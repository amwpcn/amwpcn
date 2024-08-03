import {
  ConcurrencyManager,
  ConcurrencyManagerOptions,
  Graph,
  GraphData,
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

interface ExecutionOptions<C extends IContext> {
  previous?: Step<C>;
  ancestors?: string[];
  queueOrder?: number;
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

  /**
   * @returns An object containing nodes and edges for the execution graph.
   */
  get graphData(): GraphData {
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
    await Promise.all(this._steps.map((s) => this._start(s, {})));
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
    options: ExecutionOptions<C>,
  ): Promise<void> {
    const { ancestors } = options;

    // Validate circular dependency
    const currentAncestors = ancestors
      ? [...ancestors, step.name]
      : [step.name];
    this._checkRepetitions(currentAncestors, step.name);

    // Creates a new node for the current step and links it to the previous one
    if (this._graph.enabled) {
      this._updateGraph(step, options);
    }

    // If any step other requested an immediate stop
    if (this._stopImmediate) {
      return this._stopImmediateFinalize(step);
    }

    // Preparations
    try {
      await step.prepare(this._context.get(), this._handlers);
    } catch (error) {
      if (this._defaultErrorHandler(error, step, 'prepare')) {
        return;
      }
    }

    // Executing before queue recursively
    for (let queueOrder = 0; !isBeforeEmpty(step); queueOrder++) {
      const steps = dequeueBefore(step);
      await Promise.all(
        steps.map((s) =>
          this._start(s, {
            previous: step,
            ancestors: currentAncestors,
            queueOrder,
          }),
        ),
      );

      // Before-executions always come back to the current step, hence we add the coming back edge to  the graph
      if (this._graph.enabled) {
        for (const s of steps) {
          this._updateGraph(step, {
            ...options,
            previous: s,
            queueOrder: undefined, // Coming-back-edges orders are same as initial order
          });
        }
      }

      // If any before step of the current step or highest priority step requested an immediate stop
      if (this._stopImmediate) {
        return this._stopImmediateFinalize(step);
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
      if (this._defaultErrorHandler(error, step, 'execute')) {
        await step.rollback(this._context.get(), this._handlers);
        return;
      }
    } finally {
      this._concurrencyManager.release();
    }

    // Immediate steps returned by the current execute function should be executed immediately
    // even before the after queue steps.
    await Promise.all(
      immediateSteps.map((s) =>
        this._start(s, { previous: step, ancestors: currentAncestors }),
      ),
    );

    // If any of the immediate steps requested an immediate stop
    if (this._stopImmediate) {
      return this._stopImmediateFinalize(step);
    }

    // Executing after queue recursively
    for (let queueOrder = 0; !isAfterEmpty(step); queueOrder++) {
      const steps = dequeueAfter(step);
      await Promise.all(
        steps.map((s) =>
          this._start(s, {
            previous: step,
            ancestors: currentAncestors,
            queueOrder,
          }),
        ),
      );

      // If any highest priority step requested an immediate stop
      if (this._stopImmediate) {
        return this._stopImmediateFinalize(step);
      }
    }

    // Wrapping up with final
    try {
      await step.final(this._context.get(), this._handlers);
    } catch (error) {
      if (this._defaultErrorHandler(error, step, 'final')) {
        return;
      }
    }
  }

  /**
   * Checks the number of occurrences of a step name within its ancestors to prevent exceeding the maximum allowed repetitions.
   * Throws an error if the step has been repeated more times than the maximum allowed.
   *
   * @param ancestors - An array of strings representing the ancestors of the current step.
   * @param stepName - The name of the step to check for repetitions.
   * @throws Error if the step has been repeated more times than the maximum allowed repetitions.
   */
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

  /**
   * Updates the graph with a new node representing the current step and adds an edge linking it to the previous step if it exists.
   *
   * @param current - The current step to update the graph with.
   * @param options - The execution options including the previous step, ancestors, and queue order.
   * @returns The newly created graph node representing the current step.
   */
  private _updateGraph(
    current: Step<C>,
    { previous, ancestors, queueOrder }: ExecutionOptions<C>,
  ): void {
    this._graph.addNode({
      id: stepId(current),
      label: current.name,
      ancestors,
      queueOrder,
    });

    if (previous) {
      this._graph.addEdge({
        from: stepId(previous),
        to: stepId(current),
        queueOrder,
      });
    }
  }

  private _stopImmediateFinalize(step: Step<C>): void {
    if (this._graph.enabled) {
      this._graph.setError(stepId(step));
    }
  }

  /**
   * Handles error handling for a specific stage of a step during execution.
   *
   * @param error - The error that occurred during the execution.
   * @param step - The step where the error occurred.
   * @param stage - The stage of the step where the error occurred (prepare, execute, final).
   * @returns A boolean indicating if the execution should continue.
   * If true, the execution will immediately stop, otherwise continue assuming the error was handled.
   */
  private _defaultErrorHandler(
    error: unknown,
    step: Step<C>,
    stage: StepStage,
  ): boolean {
    const fn = this._errorHandlers?.[stage];
    if (fn) {
      if (fn(error, step.name)) {
        this._handlers.stopImmediate();
        this._stopImmediateFinalize(step);
        return true;
      }

      return false;
    }

    console.error({ stepName: step.name, stage, error });
    this._handlers.stopImmediate();
    this._stopImmediateFinalize(step);
    return true;
  }
}

/**
 * Creates a new executor for the given step or array of steps with the provided context, error handlers, and options.
 *
 * @param s The step or array of steps to be executed.
 * @param c The context for the execution.
 * @param errorHandlers (Optional) The error handlers to handle any errors during execution.
 * In any of the handler, by returning false, error will be ignored and execution will be continued.
 * By returning true, the execution will be immediately stopped.
 * @example
 * ```typescript
 * const errorHandlers = {
 *  // This will stop the execution.
 *  execute(error, stepName) {
 *    console.error(stepName, error);
 *    return true;
 *  },
 *  // This will not stop the execution.
 *  final(error, stepName) {
 *    console.warn(stepName, error);
 *    return false;
 *  }
 * }
 * ```
 *
 * @param options (Optional) The options for customizing the execution behavior.
 * @returns A new StepExecutor instance initialized with the provided parameters.
 */
export function createExecutor<C extends IContext>(
  s: Step<C> | Step<C>[],
  c: C,
  errorHandlers?: ErrorHandlers,
  options?: Options,
) {
  return new StepExecutor(s, c, errorHandlers, options);
}
