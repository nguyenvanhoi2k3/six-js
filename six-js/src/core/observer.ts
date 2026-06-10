type ObserverInstance = {
  enter: () => void;
};

const observed = new WeakMap<Element, ObserverInstance>();

// ===== RAF BATCH QUEUE =====
let queue: ObserverInstance[] = [];
let rafId: number | null = null;

function schedule(instance: ObserverInstance) {
  queue.push(instance);

  if (rafId === null) {
    rafId = requestAnimationFrame(flush);
  }
}

function flush() {
  // snapshot giống GSAP (tránh mutation khi loop)
  const q = queue.slice();

  queue.length = 0;
  rafId = null;

  for (let i = 0; i < q.length; i++) {
    q[i].enter();
  }
}

// ===== INTERSECTION OBSERVER =====
const io = new IntersectionObserver(
  (entries) => {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      if (!entry.isIntersecting) continue;

      const instance = observed.get(entry.target);
      if (!instance) continue;

      // 🔥 không gọi trực tiếp → schedule
      schedule(instance);
    }
  },
  {
    threshold: 0.1,
  },
);

// ===== PUBLIC API =====

export function observe(el: Element, instance: ObserverInstance) {
  observed.set(el, instance);
  io.observe(el);
}

export function unobserve(el: Element) {
  observed.delete(el);
  io.unobserve(el);
}
