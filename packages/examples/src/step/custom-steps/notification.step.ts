import { IContext, IHandlers, IStep, step, Step } from '@amwpcn/step';
import { simulateAsyncTask } from '../helpers';

interface NotificationContext extends IContext {}

class NotificationStep implements IStep<NotificationContext> {
  private _myCustomDuration: number = 500;
  private _myCustomResult: string = '';

  async prepare(context: Readonly<NotificationContext>): Promise<void> {
    this._myCustomDuration = Math.round(Math.random() * 901 + 100);
  }

  async execute(
    context: Readonly<NotificationContext>,
    handlers: IHandlers<NotificationContext>,
  ): Promise<void | Step<NotificationContext> | Step<NotificationContext>[]> {
    await simulateAsyncTask(this._myCustomDuration);

    this._myCustomResult = 'Execution was successful!';
  }

  async final(context: Readonly<NotificationContext>): Promise<void> {
    console.log(this._myCustomResult);
  }
}

export function notification() {
  return step('Notification', new NotificationStep());
}
