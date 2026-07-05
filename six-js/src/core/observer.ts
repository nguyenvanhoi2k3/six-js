type ObserverInstance = {
  enter: () => void;
  leave?: () => void;
};

const observed = new WeakMap<Element, ObserverInstance>();
let queue: { instance: ObserverInstance; type: "enter" | "leave" }[] = [];
let rafId: number | null = null;

function schedule(instance: ObserverInstance, type: "enter" | "leave") {
  queue.push({ instance, type });
  if (rafId === null) {
    rafId = requestAnimationFrame(flush);
  }
}

function flush() {
  const q = queue.slice();
  queue.length = 0;
  rafId = null;

  for (let i = 0; i < q.length; i++) {
    const { instance, type } = q[i];

    if (type === "enter") {
      instance.enter();
    } else if (instance.leave) {
      instance.leave();
    }
  }
}

let io: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver | null {
  if (typeof window === "undefined") return null;

  if (!io) {
    io = new IntersectionObserver(
      (entries) => {
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          const instance = observed.get(entry.target);
          if (!instance) continue;

          if (entry.isIntersecting) {
            schedule(instance, "enter");
          } else {
            schedule(instance, "leave");
          }
        }
      },
      { threshold: 0.05 },
    );
  }
  return io;
}

export function observe(el: Element, instance: ObserverInstance) {
  observed.set(el, instance);
  getObserver()?.observe(el);
}

export function unobserve(el: Element) {
  observed.delete(el);
  getObserver()?.unobserve(el);
}
