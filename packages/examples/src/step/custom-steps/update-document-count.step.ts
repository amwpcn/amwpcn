import { IContext, IHandlers, Step } from '@amwpcn/step';
import { simulateAsyncTask } from '../helpers';

interface UpdateDocumentCountContext extends IContext {}

export class UpdateDocumentCountStep extends Step<UpdateDocumentCountContext> {
  readonly name = 'UpdateDocumentCount';

  async execute(
    context: Readonly<UpdateDocumentCountContext>,
    handlers: IHandlers<UpdateDocumentCountContext>,
  ): Promise<
    void | Step<UpdateDocumentCountContext>[] | Step<UpdateDocumentCountContext>
  > {
    await simulateAsyncTask();
  }
}

export function updateDocumentCount() {
  return new UpdateDocumentCountStep();
}
