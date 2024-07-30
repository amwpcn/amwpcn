import { IContext, IHandlers, Step } from '@amwpcn/step';
import { simulateAsyncTask } from '../helpers';
import { MyContext } from './common';
import { updateDocumentCount } from './update-document-count.step';

export class ImportDocumentStep extends Step<MyContext> {
  readonly name: string = 'ImportDocument';

  async execute(
    context: Readonly<MyContext>,
    handlers: IHandlers<MyContext>,
  ): Promise<void | Step<IContext>[] | Step<IContext>> {
    await simulateAsyncTask();
    handlers.contextUpdater((context) => ({
      something: `${context.something}+Updated`,
    }));

    return updateDocumentCount();
  }

  async final(context: Readonly<MyContext>): Promise<void> {
    console.log(context.something);
  }
}

export function importDocument() {
  return new ImportDocumentStep();
}
