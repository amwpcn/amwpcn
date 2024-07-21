import { IContext, IHandlers, Step } from '@amwpcn/step';
import { simulateAsyncTask } from '../helpers';

interface ImportDocumentContext extends IContext {}

export class ImportDocumentStep extends Step<ImportDocumentContext> {
  name: string = 'ImportDocument';

  async execute(
    context: ImportDocumentContext,
    handlers: IHandlers,
  ): Promise<void | Step<IContext>[] | Step<IContext>> {
    console.log('BEGIN: Importing document');
    await simulateAsyncTask();
    console.log('END: Importing document');
  }
}

export function importDocument() {
  return new ImportDocumentStep();
}
