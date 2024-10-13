import { IQueue } from '../common/queue.mjs';
import { QueueNode } from './node.mjs';

export class Queue<T> implements IQueue<T> {
  private readonly _INITIAL_MAX_SIZE = 4;

  private _maxSize: number;
  private _arr: Array<QueueNode<T>>;

  private _size = 0;
  private _front = 0;
  private _rear = 0;

  constructor(initialSize?: number) {
    this._maxSize = initialSize ?? this._INITIAL_MAX_SIZE;
    this._arr = new Array<QueueNode<T>>(this._maxSize);
  }

  get empty(): boolean {
    return this._size === 0;
  }

  /**
   * Represents a queue data structure that implements the IQueue interface.
   *
   * @template T - The type of elements stored in the queue.
   */
  enqueue(data: T): void {
    if (this._size === this._maxSize) {
      this._doubleIt();
    }

    this._arr[this._rear++] = new QueueNode(data);
    this._rear = this._rear % this._maxSize;
    this._size++;
  }

  private _doubleIt() {
    this._maxSize *= 2;
    const tempArr = new Array<QueueNode<T>>(this._maxSize);

    for (let i = 0; i < this._size; i++) {
      tempArr[i] = this._arr[(this._front + i) % this._size];
    }

    this._front = 0;
    this._rear = this._size;
    this._arr = tempArr;
  }

  dequeue(): T {
    if (this._size === 0) {
      throw new Error('Queue is empty');
    }

    const data = this._arr[this._front++].data;
    this._front = this._front % this._maxSize;
    this._size--;
    return data;
  }

  peak(): T {
    if (this._size === 0) {
      throw new Error('Queue is empty');
    }

    return this._arr[this._front].data;
  }

  toString(): string {
    const tempArr = new Array<T>(this._maxSize);
    for (let i = 0; i < this._size; i++) {
      tempArr[i] = this._arr[(this._front + i) % this._size].data;
    }

    return `[ ${tempArr.join(' | ')} ] --> size: ${this._size}`;
  }
}
