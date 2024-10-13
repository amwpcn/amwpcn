export interface IQueue<T> {
  enqueue(data: T): void;
  dequeue(): T;
  peak(): T;
}
