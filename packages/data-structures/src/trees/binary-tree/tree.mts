import { TraverseCallback, Tree } from '../common/index.mjs';
import { BinaryTreeNode } from './node.mjs';

export class BinaryTree<T> implements Tree<T> {
  private _root?: BinaryTreeNode<T> | undefined;

  private readonly _comparer: NodeSelector<T>;

  /**
   * Represents a binary tree data structure.
   *
   * @typeparam T - The type of data stored in the tree nodes.
   *
   * @param comparer The function used to compare nodes in the tree.
   * @param root Data to create the root node of the binary tree (optional).
   */
  constructor(comparer: NodeSelector<T>, root?: T | undefined) {
    this._root = root ? new BinaryTreeNode(root) : undefined;
    this._comparer = comparer;
  }

  /**
   * Returns the root node of the binary tree.
   *
   * @returns The root node of the binary tree, or undefined if the tree is empty.
   */
  root(): BinaryTreeNode<T> | undefined {
    return this._root;
  }

  /**
   * Checks if the binary tree is empty.
   *
   * @returns True if the tree is empty, false otherwise.
   */
  empty(): boolean {
    return this._root === undefined;
  }

  /**
   * Inserts a new node with the provided data into the binary tree.
   * This function will throw if the node already exists.
   *
   * @param data - The data to be inserted into the tree.
   * @returns The newly inserted BinaryTreeNode.
   */
  insert(data: T): BinaryTreeNode<T> {
    const node = new BinaryTreeNode(data);

    if (!this._root) {
      this._root = node;
      return node;
    }

    return this._insertRecursive(node, this._root);
  }

  private _insertRecursive(
    node: BinaryTreeNode<T>,
    root: BinaryTreeNode<T>,
  ): BinaryTreeNode<T> {
    const value = this._comparer(root.data(), node.data());

    if (value < 0) {
      const left = root.left();
      if (left) {
        return this._insertRecursive(node, left);
      }
      return root.setLeft(node);
    }

    if (value > 0) {
      const right = root.right();
      if (right) {
        return this._insertRecursive(node, right);
      }
      return root.setRight(node);
    }

    throw new Error('Node already exists');
  }

  preOrderTraverse(fn: TraverseCallback<T>): void {
    if (this._root) {
      this._preOrderTraverseRecursive(fn, this._root);
    }
  }

  private _preOrderTraverseRecursive(
    fn: TraverseCallback<T>,
    root: BinaryTreeNode<T>,
  ): void {
    const left = root.left();
    if (left) {
      this._preOrderTraverseRecursive(fn, left);
    }

    fn(root.data());

    const right = root.right();
    if (right) {
      this._preOrderTraverseRecursive(fn, right);
    }
  }

  postOrderTraverse(fn: TraverseCallback<T>): void {
    if (this._root) {
      this._postOrderTraverseRecursive(fn, this._root);
    }
  }

  private _postOrderTraverseRecursive(
    fn: TraverseCallback<T>,
    root: BinaryTreeNode<T>,
  ): void {
    const right = root.right();
    if (right) {
      this._postOrderTraverseRecursive(fn, right);
    }

    fn(root.data());

    const left = root.left();
    if (left) {
      this._postOrderTraverseRecursive(fn, left);
    }
  }
}

export interface NodeSelector<T> {
  (data1: T, data2: T): number;
}
