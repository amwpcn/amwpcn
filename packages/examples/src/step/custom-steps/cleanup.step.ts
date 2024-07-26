import { IContext, IHandlers, Step } from '@amwpcn/step';
import { simulateAsyncTask } from '../helpers';

interface CleanupContext extends IContext {}

export class CleanupStep extends Step<CleanupContext> {
  readonly name: string = 'CleanupStep';

  async execute(
    context: Readonly<CleanupContext>,
    handlers: IHandlers<CleanupContext>,
  ): Promise<void | Step<IContext>[] | Step<IContext>> {
    await simulateAsyncTask();
  }
}

export function cleanup() {
  return new CleanupStep();
}
