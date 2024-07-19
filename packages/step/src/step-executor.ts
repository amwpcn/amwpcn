import { IContext, IHandlers, Step } from './step';

interface ExecutionGraphOptions {
  enable: boolean;
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
    _executionGraphOptions?: ExecutionGraphOptions,
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
    await step.prepare();

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
    await step.execute(this._context, this._handlers);

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
    await step.final();
  }
}
