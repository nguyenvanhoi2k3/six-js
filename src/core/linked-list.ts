export interface ListNode<T> {
  _next: T | null;
  _prev: T | null;
}

export interface ListHandle<T> {
  first(): T | null;
  setFirst(node: T | null): void;
  last(): T | null;
  setLast(node: T | null): void;
}

/**
 * Inserts `node` into the list, keeping it ordered by ascending `key`. When several
 * nodes share the same key, the new node is inserted after them (stable append order).
 */
export function insertSorted<T extends ListNode<T>>(list: ListHandle<T>, node: T, key: (node: T) => number): void {
  const k = key(node);
  let prev = list.last();

  while (prev && key(prev) > k) {
    prev = prev._prev;
  }

  if (prev) {
    node._prev = prev;
    node._next = prev._next;
    if (prev._next) prev._next._prev = node;
    else list.setLast(node);
    prev._next = node;
  } else {
    node._prev = null;
    node._next = list.first();
    if (node._next) node._next._prev = node;
    else list.setLast(node);
    list.setFirst(node);
  }
}

/** Removes `node` from the list in O(1), given a direct reference to it. Safe to call on an already-removed node. */
export function removeNode<T extends ListNode<T>>(list: ListHandle<T>, node: T): void {
  if (node._prev) node._prev._next = node._next;
  else if (list.first() === node) list.setFirst(node._next);

  if (node._next) node._next._prev = node._prev;
  else if (list.last() === node) list.setLast(node._prev);

  node._next = null;
  node._prev = null;
}

/** Yields nodes from first to last. Safe against the current node re-parenting/removing itself mid-iteration. */
export function* forwards<T extends ListNode<T>>(list: ListHandle<T>): Generator<T> {
  let node = list.first();
  while (node) {
    const next = node._next;
    yield node;
    node = next;
  }
}

/** Yields nodes from last to first. Safe against the current node re-parenting/removing itself mid-iteration. */
export function* backwards<T extends ListNode<T>>(list: ListHandle<T>): Generator<T> {
  let node = list.last();
  while (node) {
    const prev = node._prev;
    yield node;
    node = prev;
  }
}
