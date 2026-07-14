import { describe, expect, it } from "vitest";
import { backwards, forwards, insertSorted, ListNode, removeNode } from "./linked-list";

interface Item extends ListNode<Item> {
  id: string;
  at: number;
}

function makeList() {
  const state: { first: Item | null; last: Item | null } = { first: null, last: null };
  const handle = {
    first: () => state.first,
    setFirst: (n: Item | null) => (state.first = n),
    last: () => state.last,
    setLast: (n: Item | null) => (state.last = n),
  };
  return { state, handle };
}

function item(id: string, at: number): Item {
  return { id, at, _next: null, _prev: null };
}

function idsForward(handle: ReturnType<typeof makeList>["handle"]): string[] {
  return [...forwards(handle)].map((n) => n.id);
}

describe("linked-list", () => {
  it("inserts into an empty list", () => {
    const { handle } = makeList();
    const a = item("a", 0);
    insertSorted(handle, a, (n) => n.at);
    expect(handle.first()).toBe(a);
    expect(handle.last()).toBe(a);
  });

  it("keeps ascending order by key regardless of insertion order", () => {
    const { handle } = makeList();
    const a = item("a", 5);
    const b = item("b", 1);
    const c = item("c", 3);
    insertSorted(handle, a, (n) => n.at);
    insertSorted(handle, b, (n) => n.at);
    insertSorted(handle, c, (n) => n.at);
    expect(idsForward(handle)).toEqual(["b", "c", "a"]);
  });

  it("inserts equal-key nodes after existing ones (stable order)", () => {
    const { handle } = makeList();
    const a = item("a", 1);
    const b = item("b", 1);
    const c = item("c", 1);
    insertSorted(handle, a, (n) => n.at);
    insertSorted(handle, b, (n) => n.at);
    insertSorted(handle, c, (n) => n.at);
    expect(idsForward(handle)).toEqual(["a", "b", "c"]);
  });

  it("removes from the middle in O(1) and relinks neighbors", () => {
    const { handle } = makeList();
    const a = item("a", 0);
    const b = item("b", 1);
    const c = item("c", 2);
    insertSorted(handle, a, (n) => n.at);
    insertSorted(handle, b, (n) => n.at);
    insertSorted(handle, c, (n) => n.at);

    removeNode(handle, b);

    expect(idsForward(handle)).toEqual(["a", "c"]);
    expect(b._next).toBeNull();
    expect(b._prev).toBeNull();
  });

  it("removes the first and last nodes correctly", () => {
    const { handle } = makeList();
    const a = item("a", 0);
    const b = item("b", 1);
    const c = item("c", 2);
    insertSorted(handle, a, (n) => n.at);
    insertSorted(handle, b, (n) => n.at);
    insertSorted(handle, c, (n) => n.at);

    removeNode(handle, a);
    expect(handle.first()).toBe(b);

    removeNode(handle, c);
    expect(handle.last()).toBe(b);

    removeNode(handle, b);
    expect(handle.first()).toBeNull();
    expect(handle.last()).toBeNull();
  });

  it("iterates backwards in reverse order", () => {
    const { handle } = makeList();
    const a = item("a", 0);
    const b = item("b", 1);
    const c = item("c", 2);
    insertSorted(handle, a, (n) => n.at);
    insertSorted(handle, b, (n) => n.at);
    insertSorted(handle, c, (n) => n.at);

    expect([...backwards(handle)].map((n) => n.id)).toEqual(["c", "b", "a"]);
  });

  it("survives removal of the current node during forward iteration", () => {
    const { handle } = makeList();
    const a = item("a", 0);
    const b = item("b", 1);
    const c = item("c", 2);
    insertSorted(handle, a, (n) => n.at);
    insertSorted(handle, b, (n) => n.at);
    insertSorted(handle, c, (n) => n.at);

    const seen: string[] = [];
    for (const node of forwards(handle)) {
      seen.push(node.id);
      if (node.id === "b") removeNode(handle, node);
    }

    expect(seen).toEqual(["a", "b", "c"]);
    expect(idsForward(handle)).toEqual(["a", "c"]);
  });
});
