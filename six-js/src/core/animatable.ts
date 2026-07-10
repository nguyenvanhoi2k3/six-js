export interface Animatable {
  readonly duration: number;

  render(localTime: number): void;

  onStart?(): void;

  onComplete?(): void;
}