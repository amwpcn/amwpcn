import { IContext, IHandlers, Step } from './step';

interface ExecutionGraphOptions {
  test: boolean;
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
    for (const step of this._steps) {
      this._start(step);
    }
  }

  private async _start(step: Step<C>): Promise<void> {
    await step.execute(this._context, this._handlers);
  }
}
