import { IContext } from '@amwpcn/step';

export interface MyContext extends IContext {
  something: string;
  somethingElse: string;
}
