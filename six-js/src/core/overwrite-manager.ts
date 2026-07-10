import { Playable } from "./playable";

const activeTweensByTarget = new WeakMap<HTMLElement, Set<Playable>>();

let warnedAboutAutoMode = false;

export function applyOverwrite(
  targets: readonly HTMLElement[],
  playable: Playable,
  overwrite: boolean | "auto" | undefined,
): void {
  if (!overwrite) return;

  if (overwrite === "auto" && !warnedAboutAutoMode) {
    warnedAboutAutoMode = true;
    console.warn(
      `[six-js] overwrite: "auto" (chỉ huỷ property trùng) chưa được hỗ trợ đầy đủ, ` +
        `tạm thời xử lý như overwrite: true (huỷ toàn bộ tween cũ trên cùng target).`,
    );
  }

  for (const target of targets) {
    let owners = activeTweensByTarget.get(target);

    if (!owners) {
      owners = new Set();
      activeTweensByTarget.set(target, owners);
    }

    for (const other of owners) {
      if (other !== playable) other.kill();
    }

    owners.clear();
    owners.add(playable);

    const cleanup = () => owners!.delete(playable);
    playable.on("complete", cleanup);
    playable.on("reverseComplete", cleanup);
  }
}
