import { EASINGS } from "../../easing/easing";
export class SxAnimate extends HTMLElement {
    animation;
    options;
    static counter = 0;
    order = SxAnimate.counter++;
    static mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    static get reduceMotion() {
        return this.mediaQuery.matches;
    }
    static groupQueue = new Set();
    static isProcessingGroup = false;
    static observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting)
                continue;
            const el = entry.target;
            this.observer.unobserve(el);
            if (el.isGroup) {
                this.groupQueue.add(el);
            }
            else {
                el.play();
            }
        }
        this.scheduleGroup();
    }, {
        threshold: 0,
        rootMargin: "0px",
    });
    static scheduleGroup() {
        if (this.isProcessingGroup || !this.groupQueue.size)
            return;
        this.isProcessingGroup = true;
        requestAnimationFrame(() => {
            this.handleGroup([...this.groupQueue]);
            this.groupQueue.clear();
            this.isProcessingGroup = false;
        });
    }
    static handleGroup(items) {
        items.sort((a, b) => a.order - b.order);
        items.forEach((el, index) => {
            el.play(index * 120);
        });
    }
    get isGroup() {
        return this.hasAttribute("group");
    }
    connectedCallback() {
        this.options = this.getOptions();
        if (SxAnimate.reduceMotion) {
            this.style.opacity = "1";
            this.style.transform = "none";
            return;
        }
        this.setInitialState();
        SxAnimate.observer.observe(this);
    }
    disconnectedCallback() {
        this.animation?.cancel();
        SxAnimate.observer.unobserve(this);
        SxAnimate.groupQueue.delete(this);
    }
    getOptions() {
        const strength = Number(this.getAttribute("strength")) || 30;
        const offsets = {
            fade: [0, 0],
            "fade-up": [0, strength],
            "fade-down": [0, -strength],
            "fade-left": [strength, 0],
            "fade-right": [-strength, 0],
        };
        const type = this.getAttribute("type") ?? "fade-up";
        const easing = this.getAttribute("easing");
        const [x, y] = offsets[type] ?? offsets["fade-up"];
        return {
            x,
            y,
            easing: easing && easing in EASINGS ? EASINGS[easing] : EASINGS["ease-in-out"],
            duration: Number(this.getAttribute("duration")) || 400,
            delay: Number(this.getAttribute("delay")) || 0,
        };
    }
    setInitialState() {
        const { x, y } = this.options;
        this.style.opacity = "0";
        this.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
    play(extraDelay = 0) {
        const { x, y, easing, duration, delay } = this.options;
        this.animation?.cancel();
        this.animation = this.animate([
            {
                opacity: 0,
                transform: `translate3d(${x}px, ${y}px, 0)`,
            },
            {
                opacity: 1,
                transform: "translate3d(0,0,0)",
            },
        ], {
            duration,
            delay: delay + extraDelay,
            easing,
            fill: "forwards",
        });
        this.animation.onfinish = () => {
            this.style.opacity = "1";
            this.style.transform = "translate3d(0,0,0)";
            this.animation?.cancel();
            this.animation = undefined;
        };
    }
}
customElements.define("sx-animate", SxAnimate);
//# sourceMappingURL=sx-animate.js.map