import { IHandlers, IStep, step, Step } from '@amwpcn/step';
import { simulateAsyncTask } from '../helpers';
import { MyContext } from './common';

class NotificationStep implements IStep<MyContext> {
  private _myCustomDuration: number = 500;
  private _myCustomResult: string = '';

  async prepare(context: Readonly<MyContext>): Promise<void> {
    this._myCustomDuration = Math.round(Math.random() * 901 + 100);
  }

  async execute(
    context: Readonly<MyContext>,
    handlers: IHandlers<MyContext>,
  ): Promise<void | Step<MyContext> | Step<MyContext>[]> {
    await simulateAsyncTask(this._myCustomDuration);

    this._myCustomResult = 'Execution was successful!';
  }

  async final(context: Readonly<MyContext>): Promise<void> {
    console.log(this._myCustomResult);
  }
}

export function notification() {
  return step('Notification', new NotificationStep());
}
