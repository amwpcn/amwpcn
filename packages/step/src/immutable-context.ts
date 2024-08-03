export interface IContext {}

export interface IHandlers<C extends IContext> {
  stopImmediate: () => void;
  contextUpdater: (updater: (context: Readonly<C>) => Partial<C>) => void;
}

export class ImmutableContext<C extends IContext> {
  private _context: Readonly<C>;

  constructor(context: C) {
    this._context = Object.freeze({ ...context });
  }

  get(): Readonly<C> {
    return this._context;
  }

  update(updater: (context: Readonly<C>) => Partial<C>): ImmutableContext<C> {
    const updates = updater({ ...this._context });
    const newContext = { ...this._context, ...updates };
    return new ImmutableContext(newContext);
  }
}
