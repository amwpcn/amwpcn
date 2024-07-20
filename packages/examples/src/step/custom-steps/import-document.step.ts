import { Step } from '@amwpcn/step';
import { IContext, IHandlers } from '@amwpcn/step/dist/step';
import { simulateAsyncTask } from '../helpers';

export class ImportDocumentStep extends Step {
  name: string = 'ImportDocument';

  async execute(
    context: IContext,
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
