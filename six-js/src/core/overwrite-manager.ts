// src/core/overwrite-manager.ts
import { Playable } from "./playable";

/**
 * Theo dõi tween nào đang "sở hữu" mỗi phần tử DOM, để hỗ trợ `overwrite` giống GSAP.
 *
 * Dùng WeakMap<target, Set<Playable>> — khi target bị GC (không còn ref nào khác trong
 * app), entry tự động biến mất, không cần dọn dẹp thủ công.
 *
 * GIỚI HẠN HIỆN TẠI: chỉ hỗ trợ overwrite ở cấp TOÀN BỘ TWEEN (giống `overwrite: true`
 * của GSAP đời cũ) — khi 1 tween mới target cùng 1 phần tử, MỌI tween khác đang active
 * trên phần tử đó sẽ bị kill(), bất kể có trùng property hay không.
 *
 * `overwrite: "auto"` (chỉ huỷ đúng property bị trùng, giữ nguyên phần không trùng của
 * tween cũ) CHƯA được hỗ trợ đầy đủ — vì cần SxTween cho phép gỡ bỏ 1 phần propState tại
 * runtime, việc này để lại cho 1 lần cải tiến sau. Tạm thời "auto" được xử lý như `true`
 * (an toàn hơn là bỏ qua im lặng) kèm cảnh báo 1 lần.
 */
const activeTweensByTarget = new WeakMap<HTMLElement, Set<Playable>>();

let warnedAboutAutoMode = false;

export function applyOverwrite(
  targets: readonly HTMLElement[],
  playable: Playable,
  overwrite: boolean | "auto" | undefined,
): void {
  if (!overwrite) return; // false/undefined -> không đụng gì, nhiều tween co-run tự nhiên

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

    // Tween hoàn tất (tự nhiên hoặc reverse hết) -> không còn là "chủ sở hữu" active nữa,
    // dọn khỏi registry để tránh giữ tham chiếu tới Playable đã xong việc.
    const cleanup = () => owners!.delete(playable);
    playable.on("complete", cleanup);
    playable.on("reverseComplete", cleanup);
  }
}
