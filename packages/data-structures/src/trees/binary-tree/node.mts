import { Node } from '../common/index.mjs';

export class BinaryTreeNode<T> extends Node<T> {
  private _left?: BinaryTreeNode<T>;
  private _right?: BinaryTreeNode<T>;

  constructor(data: T) {
    super(data);
  }

  get left(): BinaryTreeNode<T> | undefined {
    return this._left;
  }

  get right(): BinaryTreeNode<T> | undefined {
    return this._right;
  }

  setLeft(node: BinaryTreeNode<T>): BinaryTreeNode<T> {
    this._left = node;
    return node;
  }

  setRight(node: BinaryTreeNode<T>): BinaryTreeNode<T> {
    this._right = node;
    return node;
  }
}
