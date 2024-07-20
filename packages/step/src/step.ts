import { PriorityQueue } from './helpers';

export interface IContext {}

export interface IHandlers {
  stopImmediate: () => void;
}

/**
 * Represents an abstract class for defining a step in a process flow.
 * Manages the order of steps using priority queues for before and after execution.
 * @template C - The type of the shared context expected by all the steps.
 */
export abstract class Step<C extends IContext = IContext> {
  abstract name: string;

  // A unique id for the step. This id has to be unique within the execution context.
  private _id: string = Math.round(Date.now() * Math.random()).toString();

  private _before = new PriorityQueue<Step<C>>();
  private _after = new PriorityQueue<Step<C>>();

  constructor() {}

  get id() {
    return this._id;
  }

  get beforeQueue(): PriorityQueue<Step<C>> {
    return this._before;
  }

  get afterQueue(): PriorityQueue<Step<C>> {
    return this._after;
  }

  /**
   * Enqueues a step or an array of steps before the current step with a specified priority.
   *
   * @param item The step or array of steps to enqueue before the current step.
   * @param priority The priority of the step(s) being enqueued.
   * @returns The current Step instance after enqueuing the step(s) before it.
   */
  enqueueBefore(item: Step<C> | Step<C>[], priority: number): this {
    this._before.enqueue(item, priority);
    return this;
  }

  /**
   * Enqueues a step or an array of steps after the current step with a specified priority.
   *
   * @param item The step or array of steps to enqueue after the current step.
   * @param priority The priority of the step(s) being enqueued.
   * @returns The current Step instance after enqueuing the step(s) after it.
   */
  enqueueAfter(item: Step<C> | Step<C>[], priority: number): this {
    this._after.enqueue(item, priority);
    return this;
  }

  /**
   * Use this function if you want to do any preparation at the beginning even before executing
   * the steps in the before queue. This function is not responsible for passing anything to `execute` function.
   * If you wonder how to pass data from this function to the execute function,
   * you can use private class variables in your extended class.
   *
   * Use only for preparations needed for your current or children steps(before/after step queues)
   * It is not recommended to use this step for the execution of your step logic.
   * For anything related to your action logic that needs to be executed before the `execute` function executes,
   * create a new step and add it to the before queue with a priority as you need.
   *
   * Usage example: Select something from the database that you need for the executions of the current or children steps
   *
   * @param context The shared context object.
   */
  async prepare(context: C): Promise<void> {}

  /**
   * This is the only required function for you to implement when you extend the Step class.
   * This function should contain the logical action you need. The scope of the action is for you to decide.
   *
   * @param context The context required for the step execution. The `context` is passed
   * when you create the StepExecutor instance and all the steps that run within
   * the same StepExecutor will share this context. You can use it to share data between steps.
   * @param handlers The `handlers` contains some useful functions that you can use to handle the execution
   * for example `handlers.stopImmediate()` will stop all the executions immediately.
   * @returns A promise that resolves to void, an array of steps, or a single step.
   */
  abstract execute(
    context: C,
    handlers: IHandlers,
  ): Promise<void | Step<C>[] | Step<C>>;

  /**
   * Will perform the rollback operation for the step, if an error occurs during the execution.
   * If you have custom error handler, by returning true, the `rollback` function can be executed.
   * If any error occurs during the rollback, it will be immediately thrown.
   *
   * @param context Same `context` object that was passed to the execute function will also be passed here.
   * If you change anything during the execution of the step, those changes will also appear here.
   * @param handlers The `handlers` contains some useful functions that you can use to handle the execution
   * for example `handlers.stopImmediate()` will stop all the executions immediately.
   * @returns A promise that resolves to void, an array of steps, or a single step.
   */
  async rollback(
    context: C,
    handlers: IHandlers,
  ): Promise<void | Step<C>[] | Step<C>> {}

  /**
   * This function will be called at the end even after the execution of steps in the after queue.
   *
   * It's not recommended to use this step to do anything related your action logic.
   * You could always create a new step and add it to the after queue with a priority as you need.
   * Keep this only wrapping up.
   *
   * Usage example: Log information about the step
   *
   * @param context The shared context object.
   */
  async final(context: C): Promise<void> {}
}
