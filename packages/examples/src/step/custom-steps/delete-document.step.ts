import { IContext, IStep, step } from '@amwpcn/step';
import { simulateAsyncTask } from '../helpers';
import { updateDocumentCount } from './update-document-count.step';

interface DeleteDocumentContext extends IContext {}

const deleteDocumentStep: IStep<DeleteDocumentContext> & {
  myCustomDuration?: number;
  myCustomResult?: string;
} = {
  async prepare(context) {
    this.myCustomDuration = Math.round(Math.random() * 901 + 100); // Random number between 100 - 1000
  },
  async execute(context, handlers) {
    console.log(`This task is gonna execute: ${this.myCustomDuration}ms`);
    await simulateAsyncTask(this.myCustomDuration);

    this.myCustomResult = 'Execution went really good!';

    return updateDocumentCount();
  },
  async final(context) {
    console.log(this.myCustomResult);
  },
};

export function deleteDocument() {
  return step('DeleteDocument', deleteDocumentStep);
}
