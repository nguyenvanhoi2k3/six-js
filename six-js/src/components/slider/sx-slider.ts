import { SliderOptions } from "./slider-types";
import { SxSliderTrack } from "./sx-slider-track";
import { sliderRegistry } from "./slider-registry";

import "./sx-slider-track";
import "./sx-slider-slide";
import "./sx-slider-prev";
import "./sx-slider-next";

export class SxSlider extends HTMLElement {
  public options!: SliderOptions;
  private currentIndex: number = 0;
  private track: SxSliderTrack | null = null;
  private resizeObserver!: ResizeObserver;
  public originalSlidesCount: number = 0;
  private autoplayTimer: number | null = null;
  private isFirstInit = true;
  private lastContainerSize = 0;
  private isFirstHeightMeasure = true;

  public get sizeDim(): "width" | "height" {
    return this.options.direction === "vertical" ? "height" : "width";
  }

  public get marginProp(): "marginBottom" | "marginRight" {
    return this.options.direction === "vertical" ? "marginBottom" : "marginRight";
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
    ];
  }

  constructor() {
    super();
    this.parseOptions();
  }

  connectedCallback() {
    this.track = this.querySelector("sx-slider-track");

    if (this.options.name) {
      sliderRegistry.register(this.options.name, this);
    }

    this.resizeObserver = new ResizeObserver(() => {
      const currentSize = this.getBoundingClientRect()[this.sizeDim];
      if (currentSize !== this.lastContainerSize) {
        this.lastContainerSize = currentSize;
        this.updateLayout();
      }
    });

    this.resizeObserver.observe(this);

    if (this.track) {
      this.initLoopClones();
    }

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    this.startAutoplay();
  }

  disconnectedCallback() {
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
    const parsedInterval = intervalAttr !== null ? Number(intervalAttr) : 4000;

    const startAttr = this.getAttribute("start-index");
    const parsedStartIndex = startAttr !== null ? Number(startAttr) : 0;

    const perMoveAttr = this.getAttribute("per-move");
    let parsedPerMove: "auto" | number = "auto";
    if (perMoveAttr !== null && perMoveAttr !== "auto") {
      const num = Number(perMoveAttr);
      parsedPerMove = isNaN(num) ? "auto" : num;
    }

    let parsedDirection = this.getAttribute("direction") as "horizontal" | "vertical";
    if (parsedDirection !== "horizontal" && parsedDirection !== "vertical") {
      parsedDirection = "horizontal";
    }

    this.options = {
      name: this.getAttribute("name"),
      perView: Number(this.getAttribute("per-view")) || 1,
      gap: formatUnit(this.getAttribute("gap")),
      drag: (this.getAttribute("drag") as any) || "true",
      speed: Number(this.getAttribute("speed")) || 300,
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
      centered: this.hasAttribute("centered"),
      autoCentered: this.hasAttribute("auto-centered"),
      centerIfShort: this.hasAttribute("center-if-short"),
      direction: parsedDirection,
      verticalScroll: this.hasAttribute("vertical-scroll"),
    };
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

    const cloneCount = this.options.autoSize
      ? this.originalSlidesCount
      : this.options.perView;

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
  }

  public updateLayout() {
    if (!this.track) return;

    if (this.options.grabCursor && this.options.drag !== "false") {
      this.track.setAttribute("grab-cursor", "");
    } else {
      this.track.removeAttribute("grab-cursor");
    }

    const slides = Array.from(this.track.children) as HTMLElement[];
    if (slides.length === 0) return;

    if (this.options.loop && this.originalSlidesCount === 0) {
      this.initLoopClones();
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

    const formatUnit = (val: string | null): string => {
      if (!val) return "0px";
      return isNaN(Number(val)) ? val : `${val}px`;
    };

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
      this.options.leftPadding = formatUnit(rawLeft);
      this.options.rightPadding = formatUnit(rawRight);
    }

    const containerSize = this.getBoundingClientRect()[this.sizeDim];
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
          slide.style[this.sizeDim] = `${child.getBoundingClientRect()[this.sizeDim]}px`;
        } else {
          slide.style[this.sizeDim] = "max-content";
        }
        slide.style[this.marginProp] = this.options.gap;
      });

      this.options.perView = this.getVisibleSlidesCount();
    } else {
      const availableSize =
        containerSize -
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

    this.track.updatePosition(true);
    this.updateSlideAttributes();
  }

  public convertToPx(value: string): number {
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
    return (
      this.getRectSize(firstSlide) +
      this.convertToPx(this.options.gap)
    );
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

  public getOffsetForIndex(index: number): number {
    if (!this.track) return 0;
    const slides = Array.from(this.track.children) as HTMLElement[];
    const gapPx = this.convertToPx(this.options.gap);
    let offset = 0;

    for (let i = 0; i < index; i++) {
      if (slides[i]) {
        offset += this.getRectSize(slides[i]) + gapPx;
      }
    }
    return offset;
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
    if (!this.track || this.track.children.length === 0) return { max: 0, min: 0 };
    const containerSize = this.getBoundingClientRect()[this.sizeDim];
    const startPadPx = parseFloat(this.startPadding) || 0;
    const gapPx = this.convertToPx(this.options.gap);
    const totalSlides = this.track.children.length;

    let maxBound = 0;
    let minBound = -this.getMaxTranslate();

    if (this.options.centered && !this.options.autoCentered) {
      let firstSlideSize = this.options.autoSize
        ? (this.track.children[0] ? this.getRectSize(this.track.children[0] as HTMLElement) : 0) + gapPx
        : this.getSlideSizeWithGap();
      maxBound = startPadPx + (containerSize / 2) - (firstSlideSize / 2);

      let lastIdx = totalSlides - 1;
      let offsetToStart = this.options.autoSize ? this.getOffsetForIndex(lastIdx) : lastIdx * this.getSlideSizeWithGap();
      let lastSlideSize = this.options.autoSize ? (this.track.children[lastIdx] ? this.getRectSize(this.track.children[lastIdx] as HTMLElement) : 0) + gapPx : this.getSlideSizeWithGap();
      minBound = startPadPx + (containerSize / 2) - (offsetToStart + lastSlideSize / 2);
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

    const cloneCount = isLoop
      ? this.options.autoSize
        ? this.originalSlidesCount
        : this.options.perView
      : 0;

    const getRealIdx = (idx: number) => {
      if (!isLoop) return idx;
      let rIdx = (idx - cloneCount) % realSlideCount;
      if (rIdx < 0) rIdx += realSlideCount;
      return rIdx;
    };

    const centerOffset = this.options.centered ? 0 : Math.floor(this.options.perView / 2);

    const targetActiveReal = getRealIdx(this.currentIndex);
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
      slide.removeAttribute("sx-slide-active");
      slide.removeAttribute("sx-slide-prev");
      slide.removeAttribute("sx-slide-next");
      slide.removeAttribute("sx-slide-center");

      let realIndex = getRealIdx(index);
      slide.setAttribute("aria-label", `${realIndex + 1}/${realSlideCount}`);

      if (realIndex === targetActiveReal) slide.setAttribute("sx-slide-active", "");
      if (realIndex === targetPrevReal) slide.setAttribute("sx-slide-prev", "");
      if (realIndex === targetNextReal) slide.setAttribute("sx-slide-next", "");

      if (realIndex === targetCenterReal) slide.setAttribute("sx-slide-center", "");
    });

    this.updateAutoHeight();

    if (isInitial && tempStyle) {
      requestAnimationFrame(() => {
        tempStyle?.remove();
      });
    }
  }

  public updateAutoHeight() {
    if (!this.track) return;

    if (!this.options.autoHeight) {
      this.style.height = "";
      this.style.transition = "";
      this.track.style.alignItems = "";
      return;
    }

    this.track.style.alignItems = "center";

    const slides = Array.from(this.track.children) as HTMLElement[];
    if (slides.length === 0) return;

    let maxHeight = 0;
    const visibleCount = this.options.perView;

    for (let i = 0; i < visibleCount; i++) {
      const slideIndex = this.currentIndex + i;
      const slide = slides[slideIndex];

      if (slide) {
        const clone = slide.cloneNode(true) as HTMLElement;
        clone.style.position = "absolute";
        clone.style.visibility = "hidden";
        clone.style.pointerEvents = "none";
        clone.style.transition = "none";

        clone.style[this.sizeDim] = `${slide.getBoundingClientRect()[this.sizeDim]}px`;

        const cloneChild = clone.firstElementChild as HTMLElement;
        if (cloneChild) {
          cloneChild.style.transition = "none";
        }

        this.track.appendChild(clone);

        const height = cloneChild
          ? cloneChild.getBoundingClientRect().height
          : clone.getBoundingClientRect().height;

        if (height > maxHeight) {
          maxHeight = height;
        }

        this.track.removeChild(clone);
      }
    }

    if (maxHeight > 0) {
      this.style.transition = `height ${this.options.speed}ms ease-out`;
      this.style.height = `${maxHeight}px`;
    }
  }

  public getCurrentIndex() {
    return this.currentIndex;
  }

  public setCurrentIndex(val: number) {
    this.currentIndex = val;
    this.updateSlideAttributes();
  }

  public getRealMaxIndex(): number {
    if (!this.track || this.track.children.length === 0) return 0;
    const totalSlides = this.track.children.length;
    const { min: minBound } = this.getBoundaries();

    for (let i = 0; i < totalSlides; i++) {
      let offsetToStart = this.options.autoSize ? this.getOffsetForIndex(i) : i * this.getSlideSizeWithGap();
      let currentSlideSize = this.options.autoSize ? (this.getRectSize(this.track.children[i] as HTMLElement) + this.convertToPx(this.options.gap)) : this.getSlideSizeWithGap();

      let expectedTranslate = parseFloat(this.startPadding) || 0;
      if (this.options.centered) {
        const containerSize = this.getBoundingClientRect()[this.sizeDim];
        expectedTranslate += (containerSize / 2) - (offsetToStart + currentSlideSize / 2);
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
      return this.options.autoSize ? this.getVisibleSlidesCount() : this.options.perView;
    }

    return Math.max(1, this.options.perMove as number);
  }

  public next() {
    if (!this.track) return;
    const moveBy = this.getResolvedPerMove();

    if (this.options.loop) {
      this.currentIndex += moveBy;
      this.updateSlideAttributes();
      this.track.updatePosition();
    } else {
      const maxIndex = this.getRealMaxIndex();

      if (this.currentIndex < maxIndex) {
        this.currentIndex = Math.min(maxIndex, this.currentIndex + moveBy);
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

    if (this.options.loop) {
      this.currentIndex -= moveBy;
      this.updateSlideAttributes();
      this.track.updatePosition();
    } else {
      if (this.currentIndex > 0) {
        this.currentIndex = Math.max(0, this.currentIndex - moveBy);
      } else if (this.options.rewind) {
        this.currentIndex = this.getRealMaxIndex();
      }
      this.updateSlideAttributes();
      this.track.updatePosition();
    }
  }

  public alignIndexToFreeTranslation(translate: number) {
    if (!this.track) return;
    const startPadPx = parseFloat(this.startPadding) || 0;
    const containerSize = this.getBoundingClientRect()[this.sizeDim];
    const slides = Array.from(this.track.children) as HTMLElement[];
    const gapPx = this.convertToPx(this.options.gap);

    let closestIndex = 0;
    let minDiff = Infinity;
    const currentActive = this.currentIndex;

    for (let i = 0; i < slides.length; i++) {
      let offsetToStart = 0;
      let currentSlideSize = 0;

      if (this.options.autoSize) {
        offsetToStart = this.getOffsetForIndex(i);
        currentSlideSize = this.getRectSize(slides[i]) + gapPx;
      } else {
        const slideSize = this.getSlideSizeWithGap();
        offsetToStart = i * slideSize;
        currentSlideSize = slideSize;
      }

      let expectedTranslate = startPadPx;

      if (this.options.centered) {
        expectedTranslate +=
          containerSize / 2 - (offsetToStart + currentSlideSize / 2);
      } else {
        expectedTranslate -= offsetToStart;
      }

      if (!this.options.loop) {
        const { max: maxBound, min: minBound } = this.getBoundaries();
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
        if (Math.abs(i - currentActive) < Math.abs(closestIndex - currentActive)) {
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
}

if (!customElements.get("sx-slider")) {
  customElements.define("sx-slider", SxSlider);
}