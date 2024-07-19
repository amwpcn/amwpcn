import { IContext, IHandlers, Step } from './step';

interface ExecutionGraphOptions {
  enable: boolean;
}

interface ErrorHandlers {
  execute?: (error: unknown, stepName: string, stage: 'execute') => void;
  prepare?: (error: unknown, stepName: string, stage: 'prepare') => void;
  final?: (error: unknown, stepName: string, stage: 'final') => void;
}

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

  async start(): Promise<void> {
    // All the provided steps will start executing concurrently
    await Promise.all([...this._steps.map((s) => this._start(s))]);
  }

  private async _start(step: Step<C>): Promise<void> {
    // If any step other requested an immediate stop
    if (this._stopImmediate) {
      return;
    }

    // Preparations
    try {
      await step.prepare();
    } catch (error) {
      if (this._errorHandlers?.prepare) {
        this._errorHandlers.prepare(error, step.name, 'prepare');
      } else {
        this._defaultErrorHandler(error, step.name, 'prepare');
        // Immediately stop executing the rest of the function
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
      if (this._errorHandlers?.execute) {
        this._errorHandlers.execute(error, step.name, 'execute');
      } else {
        this._defaultErrorHandler(error, step.name, 'execute');
        // Immediately stop executing the rest of the function
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
      await step.final();
    } catch (error) {
      if (this._errorHandlers?.final) {
        this._errorHandlers.final(error, step.name, 'final');
      } else {
        this._defaultErrorHandler(error, step.name, 'final');
      }
    }
  }

  private _defaultErrorHandler(
    error: unknown,
    stepName: string,
    stage: 'execute' | 'prepare' | 'final',
  ): void {
    console.error({ stepName, stage, error });
    this._handlers.stopImmediate();
  }
}
