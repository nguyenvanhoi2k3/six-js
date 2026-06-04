export declare class SxAnimate extends HTMLElement {
    private static observer?;
    private once;
    static get observedAttributes(): string[];
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
    private getBooleanAttr;
    private setupVariables;
    private groupDelay;
}
