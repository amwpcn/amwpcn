import { IContext, IHandlers, Step } from './step';

interface ExecutionGraphOptions {
  enable: boolean;
}

type StepStage = 'execute' | 'prepare' | 'final';

interface ErrorHandlers {
  execute?: (error: unknown, stepName: string) => boolean;
  prepare?: (error: unknown, stepName: string) => boolean;
  final?: (error: unknown, stepName: string) => boolean;
}

/**
 * Class representing a StepExecutor that asynchronously starts the execution of provided steps concurrently.
 * Handles preparation, before queue execution, current step execution, after queue execution, and finalization of all steps.
 * Stops execution if an immediate stop is requested or an error occurs.
 *
 * @param s - The step or array of steps to be executed.
 * @param c - The context for the execution.
 * @param _errorHandlers - (Optional) Error handlers for handling errors during execution.
 * @param _executionGraphOptions - (Optional) Options for the execution graph.
 */
export class StepExecutor<C extends IContext> {
  private _steps: Step<C>[];
  private _context: C;
  private _stopImmediate: boolean = false;
  private _handlers: IHandlers = {
    stopImmediate: () => {
      this._stopImmediate = true;
    },
  };

  constructor(
    s: Step<C> | Step<C>[],
    c: C,
    private _errorHandlers?: ErrorHandlers,
    private _executionGraphOptions?: ExecutionGraphOptions,
  ) {
    this._steps = Array.isArray(s) ? s : [s];
    this._context = c ?? {};
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
   * @returns A Promise that resolves when the step execution is completed.
   */
  private async _start(step: Step<C>): Promise<void> {
    // If any step other requested an immediate stop
    if (this._stopImmediate) {
      return;
    }

    // Preparations
    try {
      await step.prepare(this._context);
    } catch (error) {
      if (this._defaultErrorHandler(error, step.name, 'prepare')) {
        return;
      }
    }

    // Executing before queue recursively
    const before = step.beforeQueue;
    while (!before.isEmpty) {
      const steps = before.dequeue();
      await Promise.all([...steps.map((s) => this._start(s))]);

      // If any before step of the current step or highest priority step requested an immediate stop
      if (this._stopImmediate) {
        return;
      }
    }

    // Executing the current step
    try {
      await step.execute(this._context, this._handlers);
    } catch (error) {
      if (this._defaultErrorHandler(error, step.name, 'execute')) {
        return;
      }
    }

    // Executing after queue recursively
    const after = step.afterQueue;
    while (!after.isEmpty) {
      const steps = after.dequeue();
      await Promise.all([...steps.map((s) => this._start(s))]);

      // If any highest priority step requested an immediate stop
      if (this._stopImmediate) {
        return;
      }
    }

    // Wrapping up with final
    try {
      await step.final(this._context);
    } catch (error) {
      if (this._defaultErrorHandler(error, step.name, 'final')) {
        return;
      }
    }
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
