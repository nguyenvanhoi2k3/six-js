//#region src/components/animate/sx-animate.ts
var e = class e extends HTMLElement {
	static _observer = null;
	static get observedAttributes() {
		return ["type"];
	}
	constructor() {
		super();
	}
	connectedCallback() {
		this.hasAttribute("type") || this.setAttribute("type", "fade-up"), e._observer || e._initObserver(), e._observer?.observe(this);
	}
	disconnectedCallback() {
		e._observer?.unobserve(this);
	}
	attributeChangedCallback(e, t, n) {}
	static _initObserver() {
		e._observer = new IntersectionObserver((t) => {
			t.forEach((t) => {
				if (t.isIntersecting) {
					let n = t.target;
					n.classList.add("is-animated"), n.dispatchEvent(new CustomEvent("animated", { bubbles: !0 })), e._observer?.unobserve(n);
				}
			});
		}, {
			root: null,
			rootMargin: "0px 0px -50px 0px",
			threshold: .1
		});
	}
};
customElements.get("sx-animate") || customElements.define("sx-animate", e);
//#endregion
export { e as SxAnimate };

//# sourceMappingURL=six-js.es.js.map