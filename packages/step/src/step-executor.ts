import { IContext, Step } from './step';

export class StepExecutor<C extends IContext> {
  private _steps: Step<C>[];

  constructor(
    _s: Step<C> | Step<C>[],
    private _context: C,
  ) {
    if (Array.isArray(_s)) {
      this._steps = _s;
    } else {
      this._steps = [_s];
    }
  }

  async start(): Promise<void> {
    for (const step of this._steps) {
      this._start(step);
    }
  }

  private async _start(step: Step<C>): Promise<void> {}
}
