export interface Animatable {
  readonly duration: number;

  render(localTime: number, isJump?: boolean): void;

  onStart?(): void;

  onComplete?(): void;
}