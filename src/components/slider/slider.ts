// six-js\src\components\slider\slider.ts
import { SliderOptions } from "./types";
import { SxSliderTrack } from "./slider-track";
import { sliderRegistry } from "./slider-registry";
import { ContainerBreakpoints } from "../../core/container-breakpoints";
import { parseTimeValue } from "../../core/time";
import { SafeHTMLElement } from "../../core/safe-element";

export class SxSlider extends SafeHTMLElement {
  public options!: SliderOptions;
  private originalOptions!: SliderOptions;
  private breakpointsConfig: Record<number, any> | null = null;
  private currentIndex: number = 0;
  private lastFiredIndex: number = -1;
  private track: SxSliderTrack | null = null;
  private resizeObserver!: ResizeObserver;
  public originalSlidesCount: number = 0;
  private autoplayTimer: number | null = null;
  private isFirstInit = true;
  private lastContainerSize = 0;
  private isFirstHeightMeasure = true;

  private isClickRouting = false;
  private slideOffsetsCache: number[] | null = null;

  public get sizeDim(): "width" | "height" {
    return this.options.direction === "vertical" ? "height" : "width";
  }

  public get marginProp(): "marginBottom" | "marginRight" {
    return this.options.direction === "vertical"
      ? "marginBottom"
      : "marginRight";
  }

  public get clientAxis(): "clientY" | "clientX" {
    return this.options.direction === "vertical" ? "clientY" : "clientX";
  }

  public get transformFn(): "translateY" | "translateX" {
    return this.options.direction === "vertical" ? "translateY" : "translateX";
  }

  public get startPadding(): string {
    return this.options.leftPadding;
  }

  public getCloneCount(): number {
    return this.options.autoSize
      ? this.originalSlidesCount
      : this.options.perView;
  }

  public updateProgress(translate: number, trackTransition: string) {
    let scrollRatio = 0;
    let baseRatio = 0;
    const containerSize = this.getBoundingClientRect()[this.sizeDim];

    if (!this.options.loop) {
      const { max, min } = this.getBoundaries();
      const totalScroll = max - min;

      if (totalScroll > 0) {
        scrollRatio = (max - translate) / totalScroll;
        baseRatio = containerSize / (totalScroll + containerSize);
      } else {
        scrollRatio = 1;
        baseRatio = 1;
      }
    } else {
      const originalCount = this.originalSlidesCount;
      if (originalCount > 0 && this.track) {
        const cloneCount = this.getCloneCount();
        const startPadPx = parseFloat(this.startPadding) || 0;

        let clonesSize = 0;
        let originalTrackSize = 0;

        if (this.options.autoSize) {
          clonesSize = this.getOffsetForIndex(cloneCount);
          originalTrackSize =
            this.getOffsetForIndex(cloneCount + originalCount) - clonesSize;
        } else {
          const slideSize = this.getSlideSizeWithGap();
          clonesSize = cloneCount * slideSize;
          originalTrackSize = originalCount * slideSize;
        }

        if (originalTrackSize > 0) {
          baseRatio = containerSize / originalTrackSize;

          let shiftBase = 0;
          if (this.options.centered) {
            let firstSlideSize = this.options.autoSize
              ? this.getOffsetForIndex(cloneCount + 1) -
                this.getOffsetForIndex(cloneCount)
              : this.getSlideSizeWithGap();
            shiftBase = containerSize / 2 - firstSlideSize / 2;
          }

          const startRealBound = -clonesSize + startPadPx + shiftBase;
          const distanceMoved = startRealBound - translate;

          scrollRatio = distanceMoved / originalTrackSize;
          scrollRatio = ((scrollRatio % 1) + 1) % 1;
        } else {
          scrollRatio = 1;
          baseRatio = 1;
        }
      }
    }

    baseRatio = Math.max(0, Math.min(1, baseRatio));
    const finalRatio = baseRatio + scrollRatio * (1 - baseRatio);

    let progresses = Array.from(
      this.querySelectorAll("sx-slider-progress"),
    ) as any[];
    if (this.options.name) {
      const ext = Array.from(
        document.querySelectorAll(
          `sx-slider-progress[name="${this.options.name}"]`,
        ),
      );
      progresses = [...new Set([...progresses, ...ext])];
    }

    progresses.forEach((p) => {
      if (typeof p.update === "function") {
        p.update(finalRatio, this.options.direction, trackTransition);
      }
    });
  }

  public getRectSize(el: HTMLElement): number {
    return el.getBoundingClientRect()[this.sizeDim];
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.stopAutoplay();
    } else {
      if (this.options.autoplay) {
        this.startAutoplay();
      }
    }
  };

  static get observedAttributes() {
    return [
      "name",
      "per-view",
      "gap",
      "drag",
      "speed",
      "right-padding",
      "left-padding",
      "rewind",
      "edge-resistance",
      "loop",
      "grab-cursor",
      "snap",
      "autoplay",
      "interval",
      "start-index",
      "auto-size",
      "per-move",
      "auto-height",
      "centered",
      "auto-centered",
      "center-if-short",
      "direction",
      "vertical-scroll",
      "effect",
      "breakpoints",
      "sync",
      "lock-active",
    ];
  }

  constructor() {
    super();
    this.parseOptions();
  }

  connectedCallback() {
    this.track = this.querySelector("sx-slider-track") as SxSliderTrack | null;

    if (this.options.name) {
      sliderRegistry.register(this.options.name, this);
    }

    this.resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        if (!this.isConnected) return;

        const currentSize = this.getBoundingClientRect()[this.sizeDim];
        if (currentSize !== this.lastContainerSize) {
          this.lastContainerSize = currentSize;
          this.updateLayout();
        }
      });
    });

    this.resizeObserver.observe(this);

    if (this.track) {
      let startX = 0;
      let startY = 0;

      this.track.addEventListener("mousedown", (e) => {
        startX = e.clientX;
        startY = e.clientY;
      });

      this.track.addEventListener(
        "touchstart",
        (e) => {
          if (e.touches.length > 0) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
          }
        },
        { passive: true },
      );

      this.track.addEventListener("click", (e) => {
        const diffX = Math.abs(e.clientX - startX);
        const diffY = Math.abs(e.clientY - startY);

        if (diffX > 6 || diffY > 6) return;

        const slide = (e.target as HTMLElement).closest("sx-slider-slide");
        if (!slide) return;

        const realIndexAttr = slide.getAttribute("data-real-index");
        if (realIndexAttr !== null) {
          const realIndex = parseInt(realIndexAttr, 10);
          this.goTo(realIndex, true);
        }
      });

      this.initLoopClones();
    }

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    this.startAutoplay();

    this.dispatchEvent(
      new CustomEvent("sx-slider-init", {
        bubbles: true,
        composed: true,
        detail: { name: this.options.name },
      }),
    );
  }

  disconnectedCallback() {
    this.dispatchEvent(
      new CustomEvent("sx-slider-destroy", {
        bubbles: true,
        composed: true,
        detail: { name: this.options.name },
      }),
    );

    if (this.options.name) {
      sliderRegistry.unregister(this.options.name);
    }
    this.resizeObserver.disconnect();
    this.stopAutoplay();

    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
    );
  }

  attributeChangedCallback() {
    this.parseOptions();
    this.updateLayout();
    this.startAutoplay();
  }

  private parseOptions() {
    const formatUnit = (val: string | null): string => {
      if (!val) return "0px";
      return isNaN(Number(val)) ? val : `${val}px`;
    };

    const edgeAttr = this.getAttribute("edge-resistance");
    const defaultResistance = edgeAttr !== null ? Number(edgeAttr) : 100;

    const intervalAttr = this.getAttribute("interval");
    const parsedInterval = parseTimeValue(intervalAttr, 4000);

    const startAttr = this.getAttribute("start-index");
    const parsedStartIndex = startAttr !== null ? Number(startAttr) : 0;

    const perMoveAttr = this.getAttribute("per-move");
    let parsedPerMove: "auto" | number = "auto";
    if (perMoveAttr !== null && perMoveAttr !== "auto") {
      const num = Number(perMoveAttr);
      parsedPerMove = isNaN(num) ? "auto" : num;
    }

    let parsedDirection = this.getAttribute("direction") as
      | "horizontal"
      | "vertical";
    if (parsedDirection !== "horizontal" && parsedDirection !== "vertical") {
      parsedDirection = "horizontal";
    }

    let parsedEffect = this.getAttribute("effect");
    if (parsedEffect !== "fade") parsedEffect = "slide";

    this.options = {
      name: this.getAttribute("name"),
      perView: Number(this.getAttribute("per-view")) || 1,
      gap: formatUnit(this.getAttribute("gap")),
      drag: (this.getAttribute("drag") as any) || "true",
      speed: parseTimeValue(this.getAttribute("speed"), 300),
      rightPadding: formatUnit(this.getAttribute("right-padding")),
      leftPadding: formatUnit(this.getAttribute("left-padding")),
      rewind: this.hasAttribute("rewind"),
      edgeResistance: isNaN(defaultResistance) ? 0 : defaultResistance,
      loop: this.hasAttribute("loop"),
      grabCursor: this.hasAttribute("grab-cursor"),
      snap: this.hasAttribute("snap"),
      autoplay: this.hasAttribute("autoplay"),
      interval: isNaN(parsedInterval) ? 4000 : parsedInterval,
      startIndex: isNaN(parsedStartIndex) ? 0 : parsedStartIndex,
      autoSize: this.hasAttribute("auto-size"),
      perMove: parsedPerMove,
      autoHeight: this.hasAttribute("auto-height"),
      centered:
        this.hasAttribute("centered") || this.hasAttribute("auto-centered"),
      autoCentered: this.hasAttribute("auto-centered"),
      centerIfShort: this.hasAttribute("center-if-short"),
      direction: parsedDirection,
      verticalScroll: this.hasAttribute("vertical-scroll"),
      effect: parsedEffect as "slide" | "fade",
      sync: this.getAttribute("sync"),
      lockActive: this.hasAttribute("lock-active"),
    };

    this.originalOptions = { ...this.options };
    this.breakpointsConfig = ContainerBreakpoints.parse(
      this.getAttribute("breakpoints"),
    );
  }

  public startAutoplay() {
    this.stopAutoplay();
    if (this.options.autoplay && this.options.interval > 0) {
      this.autoplayTimer = window.setInterval(() => {
        this.next();
      }, this.options.interval);
    }
  }

  public stopAutoplay() {
    if (this.autoplayTimer !== null) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  private initLoopClones() {
    if (!this.track || !this.options.loop) return;

    const existingClones = this.track.querySelectorAll("[data-clone]");
    existingClones.forEach((clone) => clone.remove());

    const originalSlides = Array.from(this.track.children) as HTMLElement[];
    this.originalSlidesCount = originalSlides.length;

    if (this.originalSlidesCount === 0) return;

    originalSlides.forEach((slide, idx) => {
      slide.setAttribute("data-real-index", idx.toString());
    });

    const cloneCount = this.getCloneCount();

    for (let i = 0; i < cloneCount; i++) {
      const targetSlide = originalSlides[originalSlides.length - 1 - i];
      const clone = targetSlide.cloneNode(true) as HTMLElement;
      clone.setAttribute("data-clone", "prev");
      this.track.insertBefore(clone, this.track.firstChild);
    }

    for (let i = 0; i < cloneCount; i++) {
      const targetSlide = originalSlides[i];
      const clone = targetSlide.cloneNode(true) as HTMLElement;
      clone.setAttribute("data-clone", "next");
      this.track.appendChild(clone);
    }

    this.invalidateOffsetsCache();
  }

  private destroyLoopClones() {
    if (!this.track) return;

    const existingClones = this.track.querySelectorAll("[data-clone]");
    existingClones.forEach((clone) => clone.remove());
    this.originalSlidesCount = 0;
    this.invalidateOffsetsCache();
  }

  private formatUnit(val: any): string {
    if (val === null || val === undefined || val === "") return "0px";
    return isNaN(Number(val)) ? String(val) : `${val}px`;
  }

  public updateLayout() {
    if (!this.track) return;

    this.style.setProperty("--sx-speed", `${this.options.speed}ms`);

    const containerSize = this.getBoundingClientRect()[this.sizeDim];
    let slides = Array.from(this.track.children) as HTMLElement[];
    if (slides.length === 0) return;

    if (!this.options.loop) {
      slides.forEach((slide, idx) => {
        slide.setAttribute("data-real-index", idx.toString());
      });
    }

    if (this.breakpointsConfig && this.originalOptions) {
      this.options = ContainerBreakpoints.getMatch(
        containerSize,
        JSON.parse(JSON.stringify(this.originalOptions)),
        this.breakpointsConfig,
      );

      const formatUnit = (val: any): string => {
        if (val === null || val === undefined || val === "") return "0px";
        return isNaN(Number(val)) ? String(val) : `${val}px`;
      };

      this.options.gap = formatUnit(this.options.gap);
      this.options.leftPadding = formatUnit(this.options.leftPadding);
      this.options.rightPadding = formatUnit(this.options.rightPadding);
    }

    if (this.options.effect === "fade") {
      this.setAttribute("data-active-effect", "fade");
    } else {
      this.removeAttribute("data-active-effect");
    }

    if (this.options.grabCursor && this.options.drag !== "false") {
      this.track.setAttribute("grab-cursor", "");
    } else {
      this.track.removeAttribute("grab-cursor");
    }

    if (this.options.loop && this.originalSlidesCount === 0) {
      this.initLoopClones();
      slides = Array.from(this.track.children) as HTMLElement[];
    } else if (!this.options.loop && this.originalSlidesCount > 0) {
      this.destroyLoopClones();
      slides = Array.from(this.track.children) as HTMLElement[];

      this.currentIndex = Math.max(
        0,
        Math.min(this.currentIndex, slides.length - 1),
      );
    }

    const cloneCount = this.track.querySelectorAll("[data-clone]").length;
    const realSlideCount = slides.length - cloneCount;

    if (this.isFirstInit && realSlideCount > 0) {
      const validStartIndex = Math.max(
        0,
        Math.min(this.options.startIndex, realSlideCount - 1),
      );
      if (this.options.loop) {
        const currentCloneCount = this.options.autoSize
          ? realSlideCount
          : this.options.perView;
        this.currentIndex = currentCloneCount + validStartIndex;
      } else {
        this.currentIndex = validStartIndex;
      }
      this.isFirstInit = false;
    }

    const rawLeft = this.getAttribute("left-padding");
    const rawRight = this.getAttribute("right-padding");

    if (
      !this.options.autoSize &&
      this.options.perView === realSlideCount &&
      rawLeft &&
      parseFloat(rawLeft) > 0 &&
      rawRight &&
      parseFloat(rawRight) > 0
    ) {
      this.options.leftPadding = "0px";
      this.options.rightPadding = "0px";
    } else {
      if (!this.breakpointsConfig) {
        this.options.leftPadding = this.formatUnit(rawLeft);
        this.options.rightPadding = this.formatUnit(rawRight);
      }
    }

    const gapPx = this.convertToPx(this.options.gap);
    const leftPadPx = this.convertToPx(this.options.leftPadding);
    const rightPadPx = this.convertToPx(this.options.rightPadding);

    if (this.options.autoSize) {
      slides.forEach((slide) => {
        slide.style[this.sizeDim] = "max-content";
      });

      this.track.offsetHeight;

      slides.forEach((slide) => {
        const child = slide.firstElementChild as HTMLElement;
        if (child) {
          slide.style[this.sizeDim] =
            `${child.getBoundingClientRect()[this.sizeDim]}px`;
        } else {
          slide.style[this.sizeDim] = "max-content";
        }
        slide.style[this.marginProp] = this.options.gap;
      });

      this.options.perView = this.getVisibleSlidesCount();
    } else {
      const validContainerSize = containerSize || window.innerWidth;
      const availableSize =
        validContainerSize -
        leftPadPx -
        rightPadPx -
        gapPx * (this.options.perView - 1);
      const slideSize = availableSize / this.options.perView;

      slides.forEach((slide) => {
        slide.style[this.sizeDim] = `${slideSize}px`;
        slide.style[this.marginProp] = this.options.gap;
      });
    }

    let isShort = false;
    const realSlides = slides.filter((s) => !s.hasAttribute("data-clone"));

    if (this.options.autoSize) {
      let totalSize = 0;
      realSlides.forEach((s) => {
        totalSize += this.getRectSize(s) + gapPx;
      });
      totalSize -= gapPx;
      isShort = totalSize < containerSize;
    } else {
      isShort = realSlideCount < this.options.perView;
    }

    if (this.options.centerIfShort && isShort) {
      this.track.style.justifyContent = "center";
      if (this.options.loop) {
        const clones = this.track.querySelectorAll("[data-clone]");
        clones.forEach((c) => c.remove());
      }
    } else {
      this.track.style.justifyContent = "";
    }

    this.invalidateOffsetsCache();
    this.track.updatePosition(true);
    this.updateSlideAttributes();
  }

  public convertToPx(value: string): number {
    if (!value || value === "0px" || value === "0") return 0;
    if (value.endsWith("px")) {
      return parseFloat(value);
    }
    const ctx = document.createElement("div");
    ctx.style.display = "none";
    ctx.style.width = value;
    document.body.appendChild(ctx);
    const px = parseFloat(getComputedStyle(ctx).width);
    document.body.removeChild(ctx);
    return px || 0;
  }

  public getSlideSizeWithGap(): number {
    if (!this.track || this.track.children.length === 0) return 0;
    const firstSlide = this.track.children[0] as HTMLElement;
    return this.getRectSize(firstSlide) + this.convertToPx(this.options.gap);
  }

  private getVisibleSlidesCount(): number {
    if (!this.track || this.track.children.length === 0) return 1;
    const containerSize = this.getBoundingClientRect()[this.sizeDim];
    let accumulatedSize = 0;
    let count = 0;
    const gapPx = this.convertToPx(this.options.gap);
    const slides = Array.from(this.track.children) as HTMLElement[];

    for (let i = 0; i < slides.length; i++) {
      accumulatedSize += this.getRectSize(slides[i]) + gapPx;
      if (accumulatedSize - gapPx > containerSize) break;
      count++;
    }
    return Math.max(1, count);
  }

  private invalidateOffsetsCache() {
    this.slideOffsetsCache = null;
  }

  private buildOffsetsCache(): number[] {
    const slides = this.track
      ? (Array.from(this.track.children) as HTMLElement[])
      : [];
    const gapPx = this.convertToPx(this.options.gap);
    const offsets: number[] = [0];

    for (let i = 0; i < slides.length; i++) {
      offsets.push(offsets[i] + this.getRectSize(slides[i]) + gapPx);
    }
    return offsets;
  }

  public getOffsetForIndex(index: number): number {
    if (!this.track) return 0;
    if (!this.slideOffsetsCache) {
      this.slideOffsetsCache = this.buildOffsetsCache();
    }
    const offsets = this.slideOffsetsCache;
    const clampedIndex = Math.max(0, Math.min(index, offsets.length - 1));
    return offsets[clampedIndex];
  }

  public getMaxTranslate(): number {
    if (!this.track || this.track.children.length === 0) return 0;
    const containerSize = this.getBoundingClientRect()[this.sizeDim];

    let totalTrackSize = 0;
    if (this.options.autoSize) {
      totalTrackSize = this.getOffsetForIndex(this.track.children.length);
      totalTrackSize -= this.convertToPx(this.options.gap);
    } else {
      const totalSlides = this.track.children.length;
      const slideSize = this.getSlideSizeWithGap();
      totalTrackSize =
        slideSize * totalSlides - this.convertToPx(this.options.gap);
    }

    return Math.max(0, totalTrackSize - containerSize);
  }

  public getBoundaries(): { max: number; min: number } {
    if (!this.track || this.track.children.length === 0)
      return { max: 0, min: 0 };
    const containerSize = this.getBoundingClientRect()[this.sizeDim];
    const startPadPx = parseFloat(this.startPadding) || 0;
    const gapPx = this.convertToPx(this.options.gap);
    const totalSlides = this.track.children.length;

    let maxBound = 0;
    let minBound = -this.getMaxTranslate();

    if (this.options.centered && !this.options.autoCentered) {
      let firstSlideSize = this.options.autoSize
        ? this.getOffsetForIndex(1) - this.getOffsetForIndex(0)
        : this.getSlideSizeWithGap();
      maxBound = startPadPx + containerSize / 2 - firstSlideSize / 2;

      let lastIdx = totalSlides - 1;
      let offsetToStart = this.options.autoSize
        ? this.getOffsetForIndex(lastIdx)
        : lastIdx * this.getSlideSizeWithGap();
      let lastSlideSize = this.options.autoSize
        ? this.getOffsetForIndex(lastIdx + 1) - offsetToStart
        : this.getSlideSizeWithGap();
      minBound =
        startPadPx + containerSize / 2 - (offsetToStart + lastSlideSize / 2);
    }
    return { max: maxBound, min: Math.min(maxBound, minBound) };
  }

  public updateSlideAttributes() {
    if (!this.track) return;

    const slides = Array.from(this.track.children) as HTMLElement[];
    if (slides.length === 0) return;

    const isLoop = this.options.loop;
    const realSlideCount = isLoop ? this.originalSlidesCount : slides.length;
    if (realSlideCount === 0) return;

    const cloneCount = isLoop ? this.getCloneCount() : 0;

    const getRealIdx = (idx: number) => {
      if (!isLoop) return idx;
      let rIdx = (idx - cloneCount) % realSlideCount;
      if (rIdx < 0) rIdx += realSlideCount;
      return rIdx;
    };

    const centerOffset = this.options.centered
      ? 0
      : Math.floor(this.options.perView / 2);

    const targetActiveReal = getRealIdx(this.currentIndex);
    if (this.lastFiredIndex !== targetActiveReal) {
      this.lastFiredIndex = targetActiveReal;
      this.dispatchEvent(
        new CustomEvent("sx-change", {
          detail: { activeIndex: targetActiveReal },
        }),
      );
    }
    const targetPrevReal = getRealIdx(this.currentIndex - 1);
    const targetNextReal = getRealIdx(this.currentIndex + 1);
    const targetCenterReal = getRealIdx(this.currentIndex + centerOffset);

    const isInitial = this.isFirstHeightMeasure;
    if (isInitial) {
      this.isFirstHeightMeasure = false;
    }

    let tempStyle: HTMLStyleElement | null = null;
    if (isInitial) {
      tempStyle = document.createElement("style");
      tempStyle.innerHTML = `sx-slider-slide, sx-slider-slide * { transition: none !important; }`;
      this.appendChild(tempStyle);
      this.offsetHeight;
    }

    slides.forEach((slide, index) => {
      const realIndex = getRealIdx(index);
      slide.setAttribute("aria-label", `${realIndex + 1}/${realSlideCount}`);
    });

    if (!(this.options.lockActive && !this.isClickRouting && !isInitial)) {
      slides.forEach((slide, index) => {
        slide.removeAttribute("sx-slide-active");
        slide.removeAttribute("sx-slide-prev");
        slide.removeAttribute("sx-slide-next");
        slide.removeAttribute("sx-slide-center");

        const realIndex = getRealIdx(index);
        if (realIndex === targetActiveReal)
          slide.setAttribute("sx-slide-active", "");
        if (realIndex === targetPrevReal)
          slide.setAttribute("sx-slide-prev", "");
        if (realIndex === targetNextReal)
          slide.setAttribute("sx-slide-next", "");

        if (realIndex === targetCenterReal)
          slide.setAttribute("sx-slide-center", "");
      });
    }

    this.updateAutoHeight();

    const maxIdx = isLoop ? realSlideCount - 1 : this.getRealMaxIndex();
    this.updateNavigation(isLoop ? undefined : maxIdx);
    const resolvedPerMove = this.getResolvedPerMove();
    let bulletIndexes: number[] = [];

    if (resolvedPerMove > 1 && !this.options.autoSize) {
      let i = 0;
      while (i < maxIdx) {
        bulletIndexes.push(i);
        i += resolvedPerMove;
      }
      if (i !== maxIdx) {
        bulletIndexes.push(maxIdx);
      }
    } else {
      for (let i = 0; i <= maxIdx; i++) {
        bulletIndexes.push(i);
      }
    }

    let activeBulletIndex = bulletIndexes.indexOf(targetActiveReal);

    if (activeBulletIndex === -1) {
      for (let i = bulletIndexes.length - 1; i >= 0; i--) {
        if (targetActiveReal >= bulletIndexes[i]) {
          activeBulletIndex = i;
          break;
        }
      }
    }

    this.updatePagination(bulletIndexes, activeBulletIndex);

    if (
      this.options.sync &&
      (this.isClickRouting || !this.options.lockActive)
    ) {
      const syncTargets = this.options.sync.split(",").map((s) => s.trim());

      syncTargets.forEach((targetName) => {
        const linkedSlider = sliderRegistry.get(targetName) as SxSlider;
        if (linkedSlider) {
          linkedSlider.syncFromController(targetActiveReal);
        }
      });
    }

    if (isInitial && tempStyle) {
      requestAnimationFrame(() => {
        tempStyle?.remove();
      });
    }
  }

  public syncFromController(realIndex: number) {
    if (!this.track) return;

    const isLoop = this.options.loop;
    const slides = Array.from(this.track.children) as HTMLElement[];
    const cloneCount = this.track.querySelectorAll("[data-clone]").length;
    const realSlideCount = isLoop
      ? this.originalSlidesCount
      : slides.length - cloneCount;

    const getRealIdx = (idx: number) => {
      if (!isLoop) return idx;
      const cCount = this.getCloneCount();
      let rIdx = (idx - cCount) % realSlideCount;
      if (rIdx < 0) rIdx += realSlideCount;
      return rIdx;
    };

    if (getRealIdx(this.currentIndex) === realIndex) return;

    if (isLoop) {
      const cCount = this.getCloneCount();
      const baseTarget = realIndex + cCount;
      const N = this.originalSlidesCount;
      const totalSlides = slides.length;

      let bestTarget = baseTarget;
      let minDistance = Math.abs(baseTarget - this.currentIndex);
      const possibleTargets = [baseTarget - N, baseTarget, baseTarget + N];

      possibleTargets.forEach((target) => {
        if (target >= 0 && target < totalSlides) {
          const dist = Math.abs(target - this.currentIndex);
          if (dist < minDistance) {
            minDistance = dist;
            bestTarget = target;
          }
        }
      });

      this.currentIndex = bestTarget;
    } else {
      this.currentIndex = Math.max(0, Math.min(realIndex, realSlideCount - 1));
    }

    this.isClickRouting = true;
    this.updateSlideAttributes();
    this.track.updatePosition();
    this.isClickRouting = false;
  }

  public updateAutoHeight() {
    if (!this.track) return;

    if (!this.options.autoHeight) {
      this.track.style.height = "";
      this.track.style.alignItems = "";
      return;
    }

    this.track.style.alignItems = "flex-start";

    const slides = Array.from(this.track.children) as HTMLElement[];
    if (slides.length === 0) return;

    const visibleCount = this.options.perView;
    const centerOffset = this.options.centered
      ? Math.floor(visibleCount / 2)
      : 0;

    let startScanIndex = this.currentIndex - centerOffset;
    if (!this.options.loop) {
      startScanIndex = Math.max(0, startScanIndex);
    }

    let maxHeight = 0;

    for (let i = 0; i < visibleCount; i++) {
      let slideIndex = startScanIndex + i;

      if (this.options.loop) {
        if (slideIndex < 0) {
          slideIndex = slides.length + slideIndex;
        } else if (slideIndex >= slides.length) {
          slideIndex = slideIndex % slides.length;
        }
      }

      const slide = slides[slideIndex];
      if (!slide) continue;

      const child = slide.firstElementChild as HTMLElement;
      const height = child
        ? child.getBoundingClientRect().height
        : slide.getBoundingClientRect().height;
      if (height > maxHeight) {
        maxHeight = height;
      }
    }

    if (maxHeight > 0) {
      this.track.style.height = `${maxHeight}px`;
    }
  }

  public getCurrentIndex(): number {
    if (!this.track) return 0;

    const isLoop = this.options.loop;
    const slides = Array.from(this.track.children);
    const realSlideCount = isLoop ? this.originalSlidesCount : slides.length;
    if (realSlideCount === 0) return 0;

    const cloneCount = isLoop ? this.getCloneCount() : 0;

    let realIdx = isLoop
      ? (this.currentIndex - cloneCount) % realSlideCount
      : this.currentIndex;
    if (realIdx < 0) realIdx += realSlideCount;

    return realIdx;
  }

  public getRawIndex(): number {
    return this.currentIndex;
  }

  public setCurrentIndex(val: number) {
    this.currentIndex = val;
    this.updateSlideAttributes();
  }

  public shiftCurrentIndex(delta: number) {
    this.currentIndex += delta;
    this.updateSlideAttributes();
  }

  public getRealMaxIndex(): number {
    if (!this.track || this.track.children.length === 0) return 0;
    const totalSlides = this.track.children.length;
    const { min: minBound } = this.getBoundaries();
    const slideSizeWithGap = this.options.autoSize
      ? 0
      : this.getSlideSizeWithGap();
    const containerSize = this.options.centered
      ? this.getBoundingClientRect()[this.sizeDim]
      : 0;

    for (let i = 0; i < totalSlides; i++) {
      let offsetToStart = this.options.autoSize
        ? this.getOffsetForIndex(i)
        : i * slideSizeWithGap;
      let currentSlideSize = this.options.autoSize
        ? this.getOffsetForIndex(i + 1) - offsetToStart
        : slideSizeWithGap;

      let expectedTranslate = parseFloat(this.startPadding) || 0;
      if (this.options.centered) {
        expectedTranslate +=
          containerSize / 2 - (offsetToStart + currentSlideSize / 2);
      } else {
        expectedTranslate -= offsetToStart;
      }

      if (expectedTranslate <= minBound + 1) {
        return i;
      }
    }
    return Math.max(0, totalSlides - 1);
  }

  private getResolvedPerMove(): number {
    if (this.options.perMove === "auto") {
      return 1;
    }
    return Math.max(1, this.options.perMove as number);
  }

  public next() {
    if (!this.track) return;
    const moveBy = this.getResolvedPerMove();
    const alignOffset = this.options.loop ? this.getCloneCount() : 0;
    const remainder =
      (((this.currentIndex - alignOffset) % moveBy) + moveBy) % moveBy;
    const step = remainder !== 0 ? moveBy - remainder : moveBy;

    if (this.options.loop) {
      this.currentIndex += step;
      this.updateSlideAttributes();
      this.track.updatePosition();
    } else {
      const maxIndex = this.getRealMaxIndex();
      if (this.currentIndex < maxIndex) {
        this.currentIndex = Math.min(maxIndex, this.currentIndex + step);
      } else if (this.options.rewind) {
        this.currentIndex = 0;
      }
      this.updateSlideAttributes();
      this.track.updatePosition();
    }
  }

  public prev() {
    if (!this.track) return;
    const moveBy = this.getResolvedPerMove();
    const alignOffset = this.options.loop ? this.getCloneCount() : 0;
    const remainder =
      (((this.currentIndex - alignOffset) % moveBy) + moveBy) % moveBy;
    const step = remainder !== 0 ? remainder : moveBy;

    if (this.options.loop) {
      this.currentIndex -= step;
      this.updateSlideAttributes();
      this.track.updatePosition();
    } else {
      if (this.currentIndex > 0) {
        this.currentIndex = Math.max(0, this.currentIndex - step);
      } else if (this.options.rewind) {
        this.currentIndex = this.getRealMaxIndex();
      }
      this.updateSlideAttributes();
      this.track.updatePosition();
    }
  }

  public goTo(index: number, isClick: boolean = false) {
    if (!this.track) return;

    if (isClick) this.isClickRouting = true;

    if (this.options.loop) {
      const cloneCount = this.getCloneCount();

      const baseTarget = index + cloneCount;
      const N = this.originalSlidesCount;
      const totalSlides = this.track.children.length;

      let bestTarget = baseTarget;
      let minDistance = Math.abs(baseTarget - this.currentIndex);
      const possibleTargets = [baseTarget - N, baseTarget, baseTarget + N];

      possibleTargets.forEach((target) => {
        if (target >= 0 && target < totalSlides) {
          const dist = Math.abs(target - this.currentIndex);
          if (dist < minDistance) {
            minDistance = dist;
            bestTarget = target;
          }
        }
      });

      this.currentIndex = bestTarget;
    } else {
      const slides = Array.from(this.track.children) as HTMLElement[];
      const cloneCount = this.track.querySelectorAll("[data-clone]").length;
      const realSlideCount = slides.length - cloneCount;

      this.currentIndex = Math.max(0, Math.min(index, realSlideCount - 1));
    }

    this.updateSlideAttributes();
    this.track.updatePosition();

    this.isClickRouting = false;
  }

  public alignIndexToFreeTranslation(translate: number) {
    if (!this.track) return;
    const startPadPx = parseFloat(this.startPadding) || 0;
    const containerSize = this.getBoundingClientRect()[this.sizeDim];
    const slides = Array.from(this.track.children) as HTMLElement[];
    const slideSizeWithGap = this.options.autoSize
      ? 0
      : this.getSlideSizeWithGap();
    const bounds = !this.options.loop ? this.getBoundaries() : null;

    let closestIndex = 0;
    let minDiff = Infinity;
    const currentActive = this.currentIndex;

    for (let i = 0; i < slides.length; i++) {
      let offsetToStart = 0;
      let currentSlideSize = 0;

      if (this.options.autoSize) {
        offsetToStart = this.getOffsetForIndex(i);
        currentSlideSize = this.getOffsetForIndex(i + 1) - offsetToStart;
      } else {
        offsetToStart = i * slideSizeWithGap;
        currentSlideSize = slideSizeWithGap;
      }

      let expectedTranslate = startPadPx;

      if (this.options.centered) {
        expectedTranslate +=
          containerSize / 2 - (offsetToStart + currentSlideSize / 2);
      } else {
        expectedTranslate -= offsetToStart;
      }

      if (bounds) {
        const { max: maxBound, min: minBound } = bounds;
        if (this.options.centered && this.options.autoCentered) {
          expectedTranslate = Math.max(
            minBound,
            Math.min(maxBound, expectedTranslate),
          );
        } else if (!this.options.centered) {
          if (i === 0) expectedTranslate = 0;
          if (expectedTranslate < minBound) expectedTranslate = minBound;
          if (expectedTranslate > 0) expectedTranslate = 0;
        }
      }

      const diff = Math.abs(translate - expectedTranslate);

      if (diff < minDiff - 0.5) {
        minDiff = diff;
        closestIndex = i;
      } else if (Math.abs(diff - minDiff) <= 0.5) {
        if (
          Math.abs(i - currentActive) < Math.abs(closestIndex - currentActive)
        ) {
          closestIndex = i;
          minDiff = diff;
        }
      }
    }

    this.currentIndex = closestIndex;

    if (!this.options.loop) {
      const maxIdx = this.getRealMaxIndex();
      this.currentIndex = Math.min(this.currentIndex, maxIdx);
    }

    this.updateSlideAttributes();
    if (this.options.loop && this.track) {
      this.track.checkLoopBoundsInstant();
    }
  }

  public updateNavigation(precomputedMaxIndex?: number) {
    let prevBtns = Array.from(this.querySelectorAll("sx-slider-prev"));
    let nextBtns = Array.from(this.querySelectorAll("sx-slider-next"));

    if (this.options.name) {
      const extPrev = Array.from(
        document.querySelectorAll(
          `sx-slider-prev[name="${this.options.name}"]`,
        ),
      );
      const extNext = Array.from(
        document.querySelectorAll(
          `sx-slider-next[name="${this.options.name}"]`,
        ),
      );
      prevBtns = [...new Set([...prevBtns, ...extPrev])] as HTMLElement[];
      nextBtns = [...new Set([...nextBtns, ...extNext])] as HTMLElement[];
    }

    if (this.options.loop || this.options.rewind) {
      prevBtns.forEach((b) => b.removeAttribute("sx-disabled"));
      nextBtns.forEach((b) => b.removeAttribute("sx-disabled"));
      return;
    }

    if (this.currentIndex <= 0) {
      prevBtns.forEach((b) => b.setAttribute("sx-disabled", ""));
    } else {
      prevBtns.forEach((b) => b.removeAttribute("sx-disabled"));
    }

    const maxIndex = precomputedMaxIndex ?? this.getRealMaxIndex();
    if (this.currentIndex >= maxIndex) {
      nextBtns.forEach((b) => b.setAttribute("sx-disabled", ""));
    } else {
      nextBtns.forEach((b) => b.removeAttribute("sx-disabled"));
    }
  }

  public updatePagination(bulletIndexes: number[], activeIndex: number) {
    let paginations = Array.from(
      this.querySelectorAll("sx-slider-pagination"),
    ) as any[];

    if (this.options.name) {
      const ext = Array.from(
        document.querySelectorAll(
          `sx-slider-pagination[name="${this.options.name}"]`,
        ),
      );
      paginations = [...new Set([...paginations, ...ext])];
    }

    paginations.forEach((p) => {
      if (typeof p.renderBullets === "function") {
        p.renderBullets(bulletIndexes);
      }
      if (typeof p.updateActive === "function") {
        p.updateActive(activeIndex);
      }
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sx-slider": SxSlider;
  }
}
