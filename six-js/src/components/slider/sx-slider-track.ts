import { SxSlider } from "./sx-slider";

export class SxSliderTrack extends HTMLElement {
  private sliderCha: SxSlider | null = null;

  private isDragging = false;
  private startX = 0;
  private currentTranslate = 0;
  private prevTranslate = 0;
  private isResetting = false;

  private dragXs: number[] = [];
  private dragTimes: number[] = [];
  private velocity = 0;

  private scrollAnimationFrameId = 0;
  private scrollDuration = 0;
  private scrollStartTime = 0;
  private scrollFrom = 0;
  private scrollToTarget = 0;
  private scrollFriction = 1;
  private isScrollAnimating = false;
  private noConstrain = false;

  private boundDragStart = this.dragStart.bind(this);
  private boundDragMove = this.dragMove.bind(this);
  private boundDragEnd = this.dragEnd.bind(this);

  constructor() {
    super();
  }

  connectedCallback() {
    this.sliderCha = this.closest("sx-slider");
    this.initDragEvents();

    this.addEventListener("transitionend", () => {
      if (!this.isResetting) {
        this.checkLoopBoundsInstant();
      }
    });
  }

  disconnectedCallback() {
    this.removeEventListener("mousedown", this.boundDragStart);
    window.removeEventListener("mousemove", this.boundDragMove);
    window.removeEventListener("mouseup", this.boundDragEnd);

    this.removeEventListener("touchstart", this.boundDragStart);
    window.removeEventListener("touchmove", this.boundDragMove);
    window.removeEventListener("touchend", this.boundDragEnd);

    this.cancelMomentumScroll();
  }

  private initDragEvents() {
    this.addEventListener("mousedown", this.boundDragStart);
    window.addEventListener("mousemove", this.boundDragMove);
    window.addEventListener("mouseup", this.boundDragEnd);

    this.addEventListener("touchstart", this.boundDragStart, { passive: true });
    window.addEventListener("touchmove", this.boundDragMove, {
      passive: false,
    });
    window.addEventListener("touchend", this.boundDragEnd);
  }

  private getPositionX(event: MouseEvent | TouchEvent): number {
    return event instanceof MouseEvent
      ? event.clientX
      : event.touches[0].clientX;
  }

  private dragStart(event: MouseEvent | TouchEvent) {
    if (!this.sliderCha || this.sliderCha.options.drag === "false") return;
    if (this.isResetting) return;

    this.sliderCha.stopAutoplay();

    this.cancelMomentumScroll();

    this.prevTranslate = this.currentTranslate;
    this.isDragging = true;
    this.startX = this.getPositionX(event);
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

    const currentX = this.getPositionX(event);
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
      const maxBound = 0;
      const minBound = -this.sliderCha.getMaxTranslate();
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
      const flickPower = 600;
      let destination = this.currentTranslate + this.velocity * flickPower;

      if (options.snap) {
        const leftPadPx = parseFloat(options.leftPadding) || 0;
        let rawDestination = destination; 

        if (options.autoWidth) {
          this.sliderCha.alignIndexToFreeTranslation(destination);
          const targetIdx = this.sliderCha.getCurrentIndex();
          destination =
            -this.sliderCha.getOffsetForIndex(targetIdx) + leftPadPx;
        } else {
          const slideWidth = this.sliderCha.getSlideWidthWithGap();
          const targetIndex = Math.round(
            (leftPadPx - destination) / slideWidth,
          );
          destination = -(targetIndex * slideWidth) + leftPadPx;
        }

        if (!options.loop) {
          const minBound = -this.sliderCha.getMaxTranslate();
          if (rawDestination <= minBound) {
            destination = minBound;
          }
        }
      }

      if (options.loop) {
        this.startMomentumScroll(destination);
      } else {
        const maxBound = 0;
        const minBound = -this.sliderCha.getMaxTranslate();

        const clampedDestination = Math.max(
          minBound,
          Math.min(maxBound, destination),
        );

        this.startMomentumScroll(clampedDestination);
      }
    } else {
      this.style.transition = `transform ${options.speed}ms ease-out`;

      const movedBy = this.currentTranslate - this.prevTranslate;

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
      if (this.sliderCha?.options.loop) this.checkLoopBoundsInstant();
      return;
    }

    this.scrollStartTime = performance.now();
    this.isScrollAnimating = true;
    this.runScrollLoop();
  }

  private runScrollLoop() {
    if (!this.isScrollAnimating || !this.sliderCha) return;

    const now = performance.now();
    const elapsed = now - this.scrollStartTime;
    const rate = Math.min(elapsed / this.scrollDuration, 1);

    const easeRate = 1 - Math.pow(1 - rate, 4);
    const target =
      this.scrollFrom + (this.scrollToTarget - this.scrollFrom) * easeRate;

    const diff = (target - this.currentTranslate) * this.scrollFriction;
    this.currentTranslate += diff;
    this.setTransform(this.currentTranslate);

    if (this.sliderCha.options.loop) {
      this.checkLoopBoundsInstant();
    } else if (!this.noConstrain) {
      const maxBound = 0;
      const minBound = -this.sliderCha.getMaxTranslate();
      const exceeded =
        this.currentTranslate > maxBound || this.currentTranslate < minBound;

      if (exceeded) {
        this.scrollFriction *= 0.6;

        if (Math.abs(diff) < 10) {
          const limit = this.currentTranslate > maxBound ? maxBound : minBound;
          this.startMomentumScroll(limit, 600, undefined, true);
          return;
        }
      }
    }

    if (rate < 1) {
      this.scrollAnimationFrameId = requestAnimationFrame(
        this.runScrollLoop.bind(this),
      );
    } else {
      this.isScrollAnimating = false;
      this.prevTranslate = this.currentTranslate;
      this.sliderCha.alignIndexToFreeTranslation(this.currentTranslate);
      this.sliderCha.startAutoplay();
    }
  }

  private cancelMomentumScroll() {
    this.isScrollAnimating = false;
    if (this.scrollAnimationFrameId) {
      cancelAnimationFrame(this.scrollAnimationFrameId);
      this.scrollAnimationFrameId = 0;
    }
  }

  public checkLoopBoundsInstant() {
    if (!this.sliderCha || !this.sliderCha.options.loop) return;

    const originalCount = this.sliderCha.originalSlidesCount;
    const cloneCount = this.sliderCha.options.autoWidth
      ? originalCount
      : this.sliderCha.options.perView;
    const leftPaddingPx = parseFloat(this.sliderCha.options.leftPadding) || 0;

    let originalTrackWidth = 0;
    let clonesWidth = 0;

    if (this.sliderCha.options.autoWidth) {
      clonesWidth = this.sliderCha.getOffsetForIndex(cloneCount);
      originalTrackWidth =
        this.sliderCha.getOffsetForIndex(cloneCount + originalCount) -
        clonesWidth;
    } else {
      const slideWidth = this.sliderCha.getSlideWidthWithGap();
      clonesWidth = cloneCount * slideWidth;
      originalTrackWidth = originalCount * slideWidth;
    }

    const startRealBound = -clonesWidth + leftPaddingPx;
    const endRealBound = startRealBound - originalTrackWidth;

    let needReset = false;
    let targetTranslate = this.currentTranslate;
    let shiftOffset = 0;
    let indexShift = 0; 

    if (this.currentTranslate > startRealBound) {
      targetTranslate = this.currentTranslate - originalTrackWidth;
      shiftOffset = -originalTrackWidth;
      indexShift = originalCount;
      needReset = true;
    } else if (this.currentTranslate <= endRealBound) {
      targetTranslate = this.currentTranslate + originalTrackWidth;
      shiftOffset = originalTrackWidth;
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

      if (this.sliderCha.options.autoWidth) {
        this.sliderCha.setCurrentIndex(
          this.sliderCha.getCurrentIndex() + indexShift,
        );
      } else {
        const slideWidth = this.sliderCha.getSlideWidthWithGap();
        const logicalIndex = Math.round(
          Math.abs(this.currentTranslate - leftPaddingPx) / slideWidth,
        );
        this.sliderCha.setCurrentIndex(logicalIndex);
      }

      this.isResetting = false;
    }
  }

  public setTransform(value: number) {
    this.style.transform = `translateX(${value}px)`;
  }

  public updatePosition(instant = false) {
    if (!this.sliderCha || this.isResetting) return;

    this.cancelMomentumScroll();
    const options = this.sliderCha.options;

    if (instant) {
      this.style.transition = "none";
    } else {
      this.style.transition = `transform ${options.speed}ms ease-out`;
    }

    const leftPaddingPx = parseFloat(options.leftPadding) || 0;
    const currentIndex = this.sliderCha.getCurrentIndex();

    let targetTranslate = leftPaddingPx;

    if (options.autoWidth) {
      targetTranslate -= this.sliderCha.getOffsetForIndex(currentIndex);
    } else {
      const slideWidth = this.sliderCha.getSlideWidthWithGap();
      targetTranslate -= currentIndex * slideWidth;
    }

    if (!options.loop) {
      if (currentIndex === 0) targetTranslate = 0;
      const minTranslate = -this.sliderCha.getMaxTranslate();
      if (targetTranslate < minTranslate) targetTranslate = minTranslate;
      if (targetTranslate > 0) targetTranslate = 0;
    }

    this.currentTranslate = targetTranslate;
    this.prevTranslate = this.currentTranslate;
    this.setTransform(this.currentTranslate);

    if (instant) {
      this.offsetHeight;
    }

    if (options.loop) {
      const cloneCount = options.perView; 
      const originalCount = this.sliderCha.originalSlidesCount;

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

if (!customElements.get("sx-slider-track")) {
  customElements.define("sx-slider-track", SxSliderTrack);
}
