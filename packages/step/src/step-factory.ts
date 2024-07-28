import { IContext, IHandlers } from './immutable-context';
import { Step } from './step';

/**
 * Interface for defining a step.
 * Implement this interface to define the required functions for step execution and it's different stages (prepare, final, rollback).
 */
export interface IStep<C extends IContext = IContext> {
  /**
   * This is the only required function for you to implement when you implement the IStep interface.
   * This function should contain the logical action you need. The scope of the action is for you to decide.
   *
   * @param context The context required for the step execution. The `context` is passed
   * when you create the StepExecutor instance and all the steps that run within
   * the same StepExecutor will share this context. You can use it to share data between steps.
   * @param handlers The `handlers` contains some useful functions that you can use to handle the execution
   * for example `handlers.stopImmediate()` will stop all the executions immediately.
   * @returns A promise that resolves to void, an array of steps, or a single step.
   */
  execute(
    context: Readonly<C>,
    handlers: IHandlers<C>,
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
  rollback?(
    context: Readonly<C>,
    handlers: IHandlers<C>,
  ): Promise<void | Step<C>[] | Step<C>>;

  /**
   * Use this function if you want to do any preparation at the beginning even before executing
   * the steps in the before queue. This function is not responsible for passing anything to `execute` function.
   * If you wonder how to pass data from this function to the execute function,
   * you can define extend the IStep interface to have your custom variables or use the context.
   *
   * @example
   * ```typescript
   *   const deleteDocumentStep: IStep<DeleteDocumentContext> & {
   *     myCustomDuration?: number;
   *     myCustomResult?: string;
   *   } = {
   *     async prepare(context) {
   *       this.myCustomDuration = Math.round(Math.random() * 901 + 100);
   *     },
   *     async execute(context, handlers) {
   *       console.log(`This task is gonna execute: ${this.myCustomDuration}ms`);
   *       await simulateAsyncTask(this.myCustomDuration);
   *
   *       this.myCustomResult = 'Execution went really good!';
   *
   *       return updateDocumentCount();
   *     },
   *     async final(context) {
   *       console.log(this.myCustomResult);
   *     },
   *   };
   * ```
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
  prepare?(context: Readonly<C>): Promise<void>;

  /**
   * This function will be called at the end even after the execution of steps in the after queue.
   * Passing data between stages example:
   * @example
   * ```typescript
   *   const deleteDocumentStep: IStep<DeleteDocumentContext> & {
   *     myCustomDuration?: number;
   *     myCustomResult?: string;
   *   } = {
   *     async prepare(context) {
   *       this.myCustomDuration = Math.round(Math.random() * 901 + 100);
   *     },
   *     async execute(context, handlers) {
   *       console.log(`This task is gonna execute: ${this.myCustomDuration}ms`);
   *       await simulateAsyncTask(this.myCustomDuration);
   *
   *       this.myCustomResult = 'Execution went really good!';
   *
   *       return updateDocumentCount();
   *     },
   *     async final(context) {
   *       console.log(this.myCustomResult);
   *     },
   *   };
   * ```
   *
   * It's not recommended to use this step to do anything related your action logic.
   * You could always create a new step and add it to the after queue with a priority as you need.
   * Keep this only wrapping up.
   *
   * Usage example: Log information about the step
   *
   * @param context The shared context object.
   */
  final?(context: Readonly<C>): Promise<void>;
}

class ConcreteStep<C extends IContext = IContext> extends Step<C> {
  name: string;
  execute(
    context: Readonly<C>,
    handlers: IHandlers<C>,
  ): Promise<void | Step<C> | Step<C>[]> {
    throw new Error('Method not implemented.');
  }

  constructor(name: string, step: IStep<C>) {
    super();
    this.name = name;
    this.execute = step.execute;
    this.prepare = step.prepare ?? this.prepare;
    this.final = step.final ?? this.final;
    this.rollback = step.rollback ?? this.rollback;
  }
}

/**
 * Creates a new step with the given name and other step information.
 *
 * @param name The name of the step.
 * @param step An object with the type of IStep representing the step logic.
 * @returns A new Step instance with the provided name and step function.
 */
export function step<C extends IContext = IContext>(
  name: string,
  step: IStep<C>,
): Step<C> {
  return new ConcreteStep<C>(name, step);
}
