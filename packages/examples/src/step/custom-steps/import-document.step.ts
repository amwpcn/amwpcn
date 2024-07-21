import { IContext, IHandlers, Step } from '@amwpcn/step';
import { simulateAsyncTask } from '../helpers';

interface ImportDocumentContext extends IContext {}

export class ImportDocumentStep extends Step<ImportDocumentContext> {
  name: string = 'ImportDocument';

  async execute(
    context: ImportDocumentContext,
    handlers: IHandlers,
  ): Promise<void | Step<IContext>[] | Step<IContext>> {
    await simulateAsyncTask();

    // this.enqueueAfter(importDocument(), 0);
  }
}

export function importDocument() {
  return new ImportDocumentStep();
}
