import { Node } from '../../common/node.mjs';

export class QueueNode<T> extends Node<T> {
  constructor(data: T) {
    super(data);
  }
}
