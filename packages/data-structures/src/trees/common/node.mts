export interface INode {}

export class Node<T> implements INode {
  private _data: T;

  constructor(data: T) {
    this._data = data;
  }

  data(): T {
    return this._data;
  }

  set(data: T): void {
    this._data = data;
  }
}
