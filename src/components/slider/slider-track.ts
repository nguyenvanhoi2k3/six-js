// six-js\src\components\slider\slider-track.ts
import { SxSlider } from "./slider";
import { InertiaPhysics } from "../../core/inertia-physics";
import { ticker, TickerListener } from "../../core/ticker";
import { setTransformValue, buildTransformString } from "../../properties/transform-state";
import { EASINGS } from "../shared/easing";
import { SafeHTMLElement } from "../../core/safe-element";

export class SxSliderTrack extends SafeHTMLElement {
  private sliderCha: SxSlider | null = null;

  private isDragging = false;
  private startX = 0;
  private currentTranslate = 0;
  private prevTranslate = 0;
  private isResetting = false;

  private dragXs: number[] = [];
  private dragTimes: number[] = [];
  private velocity = 0;

  private scrollDuration = 0;
  private scrollStartTime = 0;
  private scrollFrom = 0;
  private scrollToTarget = 0;
  private scrollFriction = 1;
  private isScrollAnimating = false;
  private noConstrain = false;
  private lastClientAxis = 0;
  private lastWheelTime = 0;

  private boundWheel = this.onWheel.bind(this);
  private boundDragStart = this.dragStart.bind(this);
  private boundDragMove = this.dragMove.bind(this);
  private boundDragEnd = this.dragEnd.bind(this);

  private handleScrollEnd = () => {
    if (!this.sliderCha) return;
    const options = this.sliderCha.options;

    if (options.snap || options.drag !== "free") {
      this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate);
      this.updatePosition();
    } else {
      if (!options.loop) {
        const { max: maxBound, min: minBound } = this.sliderCha.getBoundaries();
        const clamped = Math.max(
          minBound,
          Math.min(maxBound, this.currentTranslate),
        );
        if (clamped !== this.currentTranslate) {
          this.startMomentumScroll(clamped, 400);
        }
      }
    }
    this.sliderCha.startAutoplay();
  };

  private wheelInertia = new InertiaPhysics(
    (delta) => {
      if (!this.sliderCha) return;
      this.currentTranslate += delta;

      if (this.sliderCha.options.loop) {
        this.checkLoopBoundsInstant();
      } else {
        const { max: maxBound, min: minBound } = this.sliderCha.getBoundaries();
        const resistance = this.sliderCha.options.edgeResistance;

        if (this.currentTranslate > maxBound) {
          if (resistance <= 0) {
            this.currentTranslate = maxBound;
            this.wheelInertia.stop();
            this.handleScrollEnd();
          } else if (this.currentTranslate > maxBound + resistance) {
            this.currentTranslate = maxBound + resistance;
            this.wheelInertia.setFriction(0.2);
          } else {
            this.wheelInertia.setFriction(0.6);
          }
        } else if (this.currentTranslate < minBound) {
          if (resistance <= 0) {
            this.currentTranslate = minBound;
            this.wheelInertia.stop();
            this.handleScrollEnd();
          } else if (this.currentTranslate < minBound - resistance) {
            this.currentTranslate = minBound - resistance;
            this.wheelInertia.setFriction(0.2);
          } else {
            this.wheelInertia.setFriction(0.6);
          }
        } else {
          this.wheelInertia.setFriction(0.92);
        }
      }
      this.setTransform(this.currentTranslate);
    },
    () => this.handleScrollEnd(),
    0.92,
  );

  constructor() {
    super();
  }

  connectedCallback() {
    this.sliderCha = this.closest("sx-slider") as SxSlider | null;
    this.initDragEvents();

    this.addEventListener("transitionend", () => {
      if (!this.isResetting) {
        this.checkLoopBoundsInstant();
      }
    });
  }

  disconnectedCallback() {
    if (this.sliderCha) {
      this.sliderCha.removeEventListener("mousedown", this.boundDragStart);
      this.sliderCha.removeEventListener("touchstart", this.boundDragStart);
      this.sliderCha.removeEventListener("wheel", this.boundWheel);
    }

    this.detachWindowDragListeners();

    this.wheelInertia.stop();
    this.cancelMomentumScroll();
  }

  private initDragEvents() {
    if (!this.sliderCha) return;

    this.sliderCha.addEventListener("mousedown", this.boundDragStart);
    this.sliderCha.addEventListener("touchstart", this.boundDragStart, {
      passive: true,
    });
    this.sliderCha.addEventListener("wheel", this.boundWheel, {
      passive: false,
    });
  }

  private attachWindowDragListeners() {
    window.addEventListener("mousemove", this.boundDragMove);
    window.addEventListener("mouseup", this.boundDragEnd);
    window.addEventListener("touchmove", this.boundDragMove, {
      passive: false,
    });
    window.addEventListener("touchend", this.boundDragEnd);
  }

  private detachWindowDragListeners() {
    window.removeEventListener("mousemove", this.boundDragMove);
    window.removeEventListener("mouseup", this.boundDragEnd);
    window.removeEventListener("touchmove", this.boundDragMove);
    window.removeEventListener("touchend", this.boundDragEnd);
  }

  private onWheel(event: WheelEvent) {
    if (
      !this.sliderCha ||
      this.sliderCha.options.direction !== "vertical" ||
      !this.sliderCha.options.verticalScroll
    )
      return;

    event.preventDefault();
    this.sliderCha.stopAutoplay();

    if (this.sliderCha.options.drag === "free") {
      this.cancelMomentumScroll();
      this.style.transition = "none";
      this.wheelInertia.setFriction(0.92);

      let pushForce = -event.deltaY * 0.15;

      if (!this.sliderCha.options.loop) {
        const { max: maxBound, min: minBound } = this.sliderCha.getBoundaries();
        if (
          (this.currentTranslate > maxBound && pushForce > 0) ||
          (this.currentTranslate < minBound && pushForce < 0)
        ) {
          pushForce *= 0.2;
        }
      }

      this.wheelInertia.addVelocity(pushForce);
    } else {
      const now = performance.now();

      if (now - this.lastWheelTime > 400) {
        if (event.deltaY > 0) {
          this.sliderCha.next();
        } else if (event.deltaY < 0) {
          this.sliderCha.prev();
        }
        this.lastWheelTime = now;
      }

      this.sliderCha.startAutoplay();
    }
  }

  private getPositionAxis(event: MouseEvent | TouchEvent): number {
    if (!this.sliderCha) return 0;
    const isVertical = this.sliderCha.options.direction === "vertical";
    return event instanceof MouseEvent
      ? isVertical
        ? event.clientY
        : event.clientX
      : isVertical
        ? event.touches[0].clientY
        : event.touches[0].clientX;
  }

  private dragStart(event: MouseEvent | TouchEvent) {
    if (!this.sliderCha || this.sliderCha.options.drag === "false") return;
    if (!this.sliderCha.canScroll) return;
    if (this.isResetting) return;

    this.attachWindowDragListeners();

    this.sliderCha.stopAutoplay();
    this.cancelMomentumScroll();
    this.wheelInertia.stop();

    this.prevTranslate = this.currentTranslate;
    this.isDragging = true;
    this.startX = this.getPositionAxis(event);
    this.lastClientAxis = this.startX;
    this.velocity = 0;

    this.dragXs = [this.startX];
    this.dragTimes = [performance.now()];

    this.style.transition = "none";
    this.checkLoopBoundsInstant();
  }

  private dragMove(event: MouseEvent | TouchEvent) {
    if (!this.isDragging || !this.sliderCha) return;

    if (event.cancelable) {
      event.preventDefault();
    }

    const currentX = this.getPositionAxis(event);
    this.lastClientAxis = currentX;
    const now = performance.now();

    this.dragXs.push(currentX);
    this.dragTimes.push(now);

    while (this.dragTimes.length > 0 && now - this.dragTimes[0] > 200) {
      this.dragXs.shift();
      this.dragTimes.shift();
    }

    const diffX = currentX - this.startX;
    let targetTranslate = this.prevTranslate + diffX;

    if (this.sliderCha.options.loop) {
      this.currentTranslate = targetTranslate;
      this.checkLoopBoundsInstant();
    } else {
      const { max: maxBound, min: minBound } = this.sliderCha.getBoundaries();
      const resistance = this.sliderCha.options.edgeResistance;

      if (targetTranslate > maxBound) {
        targetTranslate =
          resistance <= 0
            ? maxBound
            : maxBound +
              Math.min(resistance, (targetTranslate - maxBound) * 0.3);
      } else if (targetTranslate < minBound) {
        targetTranslate =
          resistance <= 0
            ? minBound
            : minBound -
              Math.min(resistance, (minBound - targetTranslate) * 0.3);
      }
      this.currentTranslate = targetTranslate;
    }

    this.setTransform(this.currentTranslate);
  }

  private dragEnd() {
    if (!this.isDragging || !this.sliderCha) return;
    this.isDragging = false;
    this.detachWindowDragListeners();

    const options = this.sliderCha.options;
    const now = performance.now();

    if (this.dragTimes.length > 0) {
      const lastTime = this.dragTimes[this.dragTimes.length - 1];

      if (now - lastTime > 10) {
        this.velocity = 0;
      } else {
        const timeDiff = lastTime - this.dragTimes[0];
        if (timeDiff > 0) {
          this.velocity =
            (this.dragXs[this.dragXs.length - 1] - this.dragXs[0]) / timeDiff;
        } else {
          this.velocity = 0;
        }
      }
    } else {
      this.velocity = 0;
    }

    if (options.drag === "free") {
      this.prevTranslate = this.currentTranslate;
      const flickPower = 400;
      let destination = this.currentTranslate + this.velocity * flickPower;

      if (options.snap) {
        const startPadPx = parseFloat(this.sliderCha.startPadding) || 0;

        this.sliderCha.alignIndexToFreeTranslation(destination);
        const targetIdx = this.sliderCha.getRawIndex();

        let offsetToStart = options.autoSize
          ? this.sliderCha.getOffsetForIndex(targetIdx)
          : targetIdx * this.sliderCha.getSlideSizeWithGap();

        let currentSlideSize = options.autoSize
          ? this.sliderCha.getOffsetForIndex(targetIdx + 1) - offsetToStart
          : this.sliderCha.getSlideSizeWithGap();

        if (options.centered) {
          const containerSize =
            this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
          destination =
            startPadPx +
            containerSize / 2 -
            (offsetToStart + currentSlideSize / 2);
        } else {
          destination = startPadPx - offsetToStart;
        }

        if (!options.loop) {
          const { max: maxBound, min: minBound } =
            this.sliderCha.getBoundaries();
          destination = Math.max(minBound, Math.min(maxBound, destination));
        }
      }

      if (options.loop) {
        this.startMomentumScroll(destination);
      } else {
        const { max: maxBound, min: minBound } = this.sliderCha.getBoundaries();
        const clampedDestination = Math.max(
          minBound,
          Math.min(maxBound, destination),
        );
        this.startMomentumScroll(clampedDestination);
      }
    } else {
      this.style.transition = `transform ${options.speed}ms ease-out, height ${options.speed}ms ease-out`;

      const movedBy = this.lastClientAxis - this.startX;

      if (options.perMove === "auto") {
        const startIndex = this.sliderCha.getCurrentIndex();

        this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate);
        const dropIndex = this.sliderCha.getCurrentIndex();

        if (dropIndex === startIndex) {
          if (movedBy < -50) {
            this.sliderCha.next();
          } else if (movedBy > 50) {
            this.sliderCha.prev();
          } else {
            this.updatePosition();
          }
        } else {
          this.updatePosition();
        }
      } else {
        if (movedBy < -50) {
          this.sliderCha.next();
        } else if (movedBy > 50) {
          this.sliderCha.prev();
        } else {
          this.updatePosition();
        }
      }

      this.sliderCha.startAutoplay();
    }
  }

  private scrollTickerCallback: TickerListener = () => this.runScrollLoop();

  private startMomentumScroll(
    destination: number,
    duration?: number,
    callback?: () => void,
    noConstrain = false,
  ) {
    this.cancelMomentumScroll();

    this.scrollFrom = this.currentTranslate;
    this.scrollToTarget = destination;
    this.scrollFriction = 1;
    this.noConstrain = noConstrain;

    const distance = Math.abs(destination - this.scrollFrom);
    this.scrollDuration = duration ?? Math.max(distance / 1.5, 800);

    if (distance < 1) {
      this.currentTranslate = destination;
      this.setTransform(this.currentTranslate);
      this.prevTranslate = this.currentTranslate;
      this.sliderCha?.alignIndexToFreeTranslation(this.currentTranslate);
      if (callback) callback();
      return;
    }

    this.scrollStartTime = performance.now();
    this.isScrollAnimating = true;

    ticker.add(this.scrollTickerCallback);
  }

  private runScrollLoop() {
    if (!this.isScrollAnimating || !this.sliderCha) return;

    const now = performance.now();
    const elapsed = now - this.scrollStartTime;
    const rate = Math.min(elapsed / this.scrollDuration, 1);

    const easeRate = EASINGS.quartOut(rate);
    const target =
      this.scrollFrom + (this.scrollToTarget - this.scrollFrom) * easeRate;

    const diff = (target - this.currentTranslate) * this.scrollFriction;
    this.currentTranslate += diff;
    this.setTransform(this.currentTranslate);

    if (this.sliderCha.options.loop) {
      this.checkLoopBoundsInstant();
    } else if (!this.noConstrain) {
      const { max: maxBound, min: minBound } = this.sliderCha.getBoundaries();
      const resistance = this.sliderCha.options.edgeResistance;

      const exceeded =
        this.currentTranslate > maxBound || this.currentTranslate < minBound;

      if (exceeded) {
        if (this.currentTranslate > maxBound) {
          if (resistance <= 0) {
            this.currentTranslate = maxBound;
            this.setTransform(this.currentTranslate);
            this.cancelMomentumScroll();
            this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate > maxBound + resistance) {
            this.currentTranslate = maxBound + resistance;
            this.setTransform(this.currentTranslate);
            this.cancelMomentumScroll();
            this.startMomentumScroll(maxBound, 600, undefined, true);
            return;
          }
        } else if (this.currentTranslate < minBound) {
          if (resistance <= 0) {
            this.currentTranslate = minBound;
            this.setTransform(this.currentTranslate);
            this.cancelMomentumScroll();
            this.sliderCha.startAutoplay();
            return;
          } else if (this.currentTranslate < minBound - resistance) {
            this.currentTranslate = minBound - resistance;
            this.setTransform(this.currentTranslate);
            this.cancelMomentumScroll();
            this.startMomentumScroll(minBound, 600, undefined, true);
            return;
          }
        }

        this.scrollFriction *= 0.6;

        if (Math.abs(diff) < 1) {
          const limit = this.currentTranslate > maxBound ? maxBound : minBound;
          this.startMomentumScroll(limit, 600, undefined, true);
          return;
        }
      }
    }

    if (rate >= 1 && Math.abs(diff) < 0.5) {
      this.isScrollAnimating = false;
      this.prevTranslate = this.currentTranslate;
      ticker.remove(this.scrollTickerCallback);
      this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate);
      this.sliderCha.startAutoplay();
    }
  }

  private cancelMomentumScroll() {
    this.isScrollAnimating = false;
    ticker.remove(this.scrollTickerCallback);
  }

  public checkLoopBoundsInstant() {
    if (!this.sliderCha || !this.sliderCha.options.loop) return;

    const originalCount = this.sliderCha.originalSlidesCount;
    const cloneCount = this.sliderCha.getCloneCount();
    const startPaddingPx = parseFloat(this.sliderCha.startPadding) || 0;

    let originalTrackSize = 0;
    let clonesSize = 0;

    if (this.sliderCha.options.autoSize) {
      clonesSize = this.sliderCha.getOffsetForIndex(cloneCount);
      originalTrackSize =
        this.sliderCha.getOffsetForIndex(cloneCount + originalCount) -
        clonesSize;
    } else {
      const slideSize = this.sliderCha.getSlideSizeWithGap();
      clonesSize = cloneCount * slideSize;
      originalTrackSize = originalCount * slideSize;
    }

    let shiftBase = 0;
    if (this.sliderCha.options.centered) {
      const containerSize =
        this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      let firstSlideSize = 0;
      if (this.sliderCha.options.autoSize) {
        firstSlideSize =
          this.sliderCha.getOffsetForIndex(cloneCount + 1) -
          this.sliderCha.getOffsetForIndex(cloneCount);
      } else {
        firstSlideSize = this.sliderCha.getSlideSizeWithGap();
      }
      shiftBase = containerSize / 2 - firstSlideSize / 2;
    }

    const startRealBound = -clonesSize + startPaddingPx + shiftBase;
    const endRealBound = startRealBound - originalTrackSize;

    let needReset = false;
    let targetTranslate = this.currentTranslate;
    let shiftOffset = 0;
    let indexShift = 0;

    const tolerance = this.sliderCha.options.centered ? 50 : 0;

    if (this.currentTranslate > startRealBound + tolerance) {
      targetTranslate = this.currentTranslate - originalTrackSize;
      shiftOffset = -originalTrackSize;
      indexShift = originalCount;
      needReset = true;
    } else if (this.currentTranslate <= endRealBound - tolerance) {
      targetTranslate = this.currentTranslate + originalTrackSize;
      shiftOffset = originalTrackSize;
      indexShift = -originalCount;
      needReset = true;
    }

    if (needReset) {
      this.isResetting = true;
      this.style.transition = "none";

      this.currentTranslate = targetTranslate;
      this.prevTranslate = this.currentTranslate;

      if (this.isScrollAnimating) {
        this.scrollFrom += shiftOffset;
        this.scrollToTarget += shiftOffset;
      }

      this.setTransform(this.currentTranslate);

      this.sliderCha.shiftCurrentIndex(indexShift);

      this.isResetting = false;
    }
  }

  public setTransform(value: number) {
    if (!this.sliderCha) return;

    setTransformValue(this, this.sliderCha.transformFn === "translateY" ? "y" : "x", value);
    this.style.transform = buildTransformString(this);

    this.sliderCha.updateProgress(value, this.style.transition);
  }

  public updatePosition(instant = false) {
    if (!this.sliderCha || this.isResetting) return;

    this.cancelMomentumScroll();
    const options = this.sliderCha.options;

    if (instant) {
      this.style.transition = "none";
    } else {
      this.style.transition = `transform ${options.speed}ms ease-out, height ${options.speed}ms ease-out`;
    }

    const startPaddingPx = parseFloat(this.sliderCha.startPadding) || 0;
    const currentIndex = this.sliderCha.getRawIndex();

    let targetTranslate = startPaddingPx;
    let offsetToStart = 0;
    let currentSlideSize = 0;

    if (options.autoSize) {
      offsetToStart = this.sliderCha.getOffsetForIndex(currentIndex);
      currentSlideSize =
        this.sliderCha.getOffsetForIndex(currentIndex + 1) - offsetToStart;
    } else {
      const slideSize = this.sliderCha.getSlideSizeWithGap();
      offsetToStart = currentIndex * slideSize;
      currentSlideSize = slideSize;
    }

    if (options.centered) {
      const containerSize =
        this.sliderCha.getBoundingClientRect()[this.sliderCha.sizeDim];
      targetTranslate +=
        containerSize / 2 - (offsetToStart + currentSlideSize / 2);
    } else {
      targetTranslate -= offsetToStart;
    }

    if (!options.loop) {
      const { max: maxBound, min: minBound } = this.sliderCha.getBoundaries();
      targetTranslate = Math.max(minBound, Math.min(maxBound, targetTranslate));
    }

    this.currentTranslate = targetTranslate;
    this.prevTranslate = this.currentTranslate;
    this.setTransform(this.currentTranslate);

    if (instant) {
      this.offsetHeight;
    }

    if (options.loop) {
      const originalCount = this.sliderCha.originalSlidesCount;
      const cloneCount = this.sliderCha.getCloneCount();

      if (
        currentIndex >= cloneCount + originalCount ||
        currentIndex < cloneCount
      ) {
        setTimeout(() => {
          this.checkLoopBoundsInstant();
        }, options.speed);
      }
    }
  }
}
