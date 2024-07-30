import { IContext, IHandlers, Step } from '@amwpcn/step';
import { simulateAsyncTask } from '../helpers';
import { MyContext } from './common';

export class CleanupStep extends Step<MyContext> {
  readonly name: string = 'CleanupStep';

  async execute(
    context: Readonly<MyContext>,
    handlers: IHandlers<MyContext>,
  ): Promise<void | Step<IContext>[] | Step<IContext>> {
    await simulateAsyncTask();
  }
}

export function cleanup() {
  return new CleanupStep();
}
