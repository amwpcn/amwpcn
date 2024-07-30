import { IHandlers, Step } from '@amwpcn/step';
import { simulateAsyncTask } from '../helpers';
import { MyContext } from './common';

export class UpdateDocumentCountStep extends Step<MyContext> {
  readonly name = 'UpdateDocumentCount';

  async execute(
    context: Readonly<MyContext>,
    handlers: IHandlers<MyContext>,
  ): Promise<void | Step<MyContext>[] | Step<MyContext>> {
    await simulateAsyncTask();
  }
}

export function updateDocumentCount() {
  return new UpdateDocumentCountStep();
}
