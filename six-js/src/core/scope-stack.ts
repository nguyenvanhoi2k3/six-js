export interface Killable {
  kill(): void;
}

export interface ScopeCapture {
  _capture(target: Killable): void;
}

const stack: ScopeCapture[] = [];

export function pushActiveScope(scope: ScopeCapture): void {
  stack.push(scope);
}

export function popActiveScope(): void {
  stack.pop();
}

export function getActiveScope(): ScopeCapture | undefined {
  return stack[stack.length - 1];
}
