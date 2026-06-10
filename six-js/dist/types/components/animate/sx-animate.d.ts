export declare class SxAnimate extends HTMLElement {
    private animation?;
    private options;
    private static counter;
    private readonly order;
    private static mediaQuery;
    private static get reduceMotion();
    static groupQueue: Set<SxAnimate>;
    static isProcessingGroup: boolean;
    static observer: IntersectionObserver;
    private static scheduleGroup;
    static handleGroup(items: SxAnimate[]): void;
    get isGroup(): boolean;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private getOptions;
    private setInitialState;
    play(extraDelay?: number): void;
}
