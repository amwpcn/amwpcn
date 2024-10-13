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

  /**
   * Returns a boolean value indicating whether the queue is empty.
   */
  get empty(): boolean {
    return this._size === 0;
  }

  /**
   * Adds the provided data to the queue.
   * If the queue is full, it doubles its capacity before adding the data.
   *
   * @param data - The data to be added to the queue.
   * @returns void
   */
  enqueue(data: T): void {
    if (this._size === this._maxSize) {
      this._doubleIt();
    }

    this._arr[this._rear++] = new QueueNode(data);
    this._rear = this._rear % this._maxSize;
    this._size++;
  }

  private _doubleIt(): void {
    this._maxSize *= 2;
    const tempArr = new Array<QueueNode<T>>(this._maxSize);

    for (let i = 0; i < this._size; i++) {
      tempArr[i] = this._arr[(this._front + i) % this._size];
    }

    this._front = 0;
    this._rear = this._size;
    this._arr = tempArr;
  }

  /**
   * Removes and returns the front element of the queue.
   * If the queue is empty, throws an error.
   *
   * @returns The data of the front element that was removed.
   */
  dequeue(): T {
    if (this._size === 0) {
      throw new Error('Queue is empty');
    }

    const data = this._arr[this._front++].data;
    this._front = this._front % this._maxSize;
    this._size--;
    return data;
  }

  /**
   * Returns the data of the front element of the queue without removing it.
   * If the queue is empty, throws an error.
   *
   * @returns The data of the front element of the queue.
   */
  peak(): T {
    if (this._size === 0) {
      throw new Error('Queue is empty');
    }

    return this._arr[this._front].data;
  }

  /**
   * Returns a string representation of the elements in the queue.
   * It creates a temporary array to store the elements in the correct order,
   * then joins them with a separator and includes the current size of the queue.
   *
   * @returns A string representing the elements in the queue and its size.
   */
  toString(): string {
    const tempArr = new Array<T>(this._maxSize);
    for (let i = 0; i < this._size; i++) {
      tempArr[i] = this._arr[(this._front + i) % this._size].data;
    }

    return `[ ${tempArr.join(' | ')} ] --> size: ${this._size}`;
  }
}
