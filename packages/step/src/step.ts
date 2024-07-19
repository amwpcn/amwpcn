import { PriorityQueue } from './helpers';

export interface IContext {}

export interface Handlers {
  stopImmediate: () => void;
}

export abstract class Step<C extends IContext = IContext> {
  private _before = new PriorityQueue<Step<C>>();
  private _after = new PriorityQueue<Step<C>>();

  constructor() {}

  enqueueBefore(item: Step<C> | Step<C>[], priority: number): this {
    this._before.enqueue(item, priority);
    return this;
  }

  enqueueAfter(item: Step<C> | Step<C>[], priority: number): this {
    this._after.enqueue(item, priority);
    return this;
  }

  dequeueBefore(): Step<C>[] {
    return this._before.dequeue() as Step<C>[];
  }

  dequeueAfter(): Step<C>[] {
    return this._after.dequeue() as Step<C>[];
  }

  protected prepare(): void {}
  protected abstract execute(
    context: C,
    handlers: Handlers,
  ): void | Step<C>[] | Step<C>;
  protected final(): void {}
}
