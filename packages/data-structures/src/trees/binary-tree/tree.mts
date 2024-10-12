import { ITree, TraverseCallback } from '../common/index.mjs';
import { BinaryTreeNode } from './node.mjs';

export class BinaryTree<T> implements ITree<T> {
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
  get root(): BinaryTreeNode<T> | undefined {
    return this._root;
  }

  /**
   * Checks if the binary tree is empty.
   *
   * @returns True if the tree is empty, false otherwise.
   */
  get empty(): boolean {
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
    const value = this._comparer(root.data, node.data);

    if (value < 0) {
      if (root.left) {
        return this._insertRecursive(node, root.left);
      }
      return root.setLeft(node);
    }

    if (value > 0) {
      if (root.right) {
        return this._insertRecursive(node, root.right);
      }
      return root.setRight(node);
    }

    throw new Error('Node already exists');
  }

  /**
   * Performs a pre-order traversal of the binary tree starting from the root node.
   * Executes the provided callback function on each node's data in the order: root, left, right.
   *
   * @typeparam T - The type of data stored in the tree nodes.
   *
   * @param fn The callback function to be executed on each node's data during traversal.
   * @returns void
   */
  preOrderTraverse(fn: TraverseCallback<T>): void {
    if (this._root) {
      this._preOrderTraverseRecursive(fn, this._root);
    }
  }

  private _preOrderTraverseRecursive(
    fn: TraverseCallback<T>,
    root: BinaryTreeNode<T>,
  ): void {
    fn(root.data);

    if (root.left) {
      this._preOrderTraverseRecursive(fn, root.left);
    }

    if (root.right) {
      this._preOrderTraverseRecursive(fn, root.right);
    }
  }

  /**
   * Performs a post-order traversal of the binary tree starting from the root node.
   * Executes the provided callback function on each node's data in the order: left, right, root.
   *
   * @typeparam T - The type of data stored in the tree nodes.
   *
   * @param fn The callback function to be executed on each node's data during traversal.
   * @returns void
   */
  postOrderTraverse(fn: TraverseCallback<T>): void {
    if (this._root) {
      this._postOrderTraverseRecursive(fn, this._root);
    }
  }

  private _postOrderTraverseRecursive(
    fn: TraverseCallback<T>,
    root: BinaryTreeNode<T>,
  ): void {
    if (root.left) {
      this._postOrderTraverseRecursive(fn, root.left);
    }

    if (root.right) {
      this._postOrderTraverseRecursive(fn, root.right);
    }

    fn(root.data);
  }

  /**
   * Performs an in-order traversal of the binary tree starting from the root node.
   * Executes the provided callback function on each node's data in the order: left, root, right.
   *
   * @typeparam T - The type of data stored in the tree nodes.
   *
   * @param fn The callback function to be executed on each node's data during traversal.
   * @returns void
   */
  inOrderTraverse(fn: TraverseCallback<T>): void {
    if (this._root) {
      this._inOrderTraverseRecursive(fn, this._root);
    }
  }

  private _inOrderTraverseRecursive(
    fn: TraverseCallback<T>,
    root: BinaryTreeNode<T>,
  ): void {
    if (root.left) {
      this._inOrderTraverseRecursive(fn, root.left);
    }

    fn(root.data);

    if (root.right) {
      this._inOrderTraverseRecursive(fn, root.right);
    }
  }
}

export interface NodeSelector<T> {
  (data1: T, data2: T): number;
}
