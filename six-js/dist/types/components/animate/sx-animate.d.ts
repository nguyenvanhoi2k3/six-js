export type AnimationType = 'fade-up' | 'fade-down' | 'fade-in';
export declare class SxAnimate extends HTMLElement {
    private static _observer;
    static get observedAttributes(): string[];
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    private static _initObserver;
}
