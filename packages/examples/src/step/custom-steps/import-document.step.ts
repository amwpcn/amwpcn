import { IContext, IHandlers, Step } from '@amwpcn/step';
import { simulateAsyncTask } from '../helpers';
import { updateDocumentCount } from './update-document-count.step';

interface ImportDocumentContext extends IContext {}

export class ImportDocumentStep extends Step<ImportDocumentContext> {
  readonly name: string = 'ImportDocument';

  async execute(
    context: Readonly<ImportDocumentContext>,
    handlers: IHandlers<ImportDocumentContext>,
  ): Promise<void | Step<IContext>[] | Step<IContext>> {
    await simulateAsyncTask();

    // this.enqueueAfter(importDocument(), 0);
    return updateDocumentCount();
  }
}

export function importDocument() {
  return new ImportDocumentStep();
}
