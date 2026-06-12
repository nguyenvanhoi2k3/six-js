import { SliderOptions } from "./slider-types";
import { SxSliderTrack } from "./sx-slider-track";
import { sliderRegistry } from "./slider-registry";

export class SxSlider extends HTMLElement {
  public options!: SliderOptions;
  private currentIndex: number = 0;
  private track: SxSliderTrack | null = null;
  private resizeObserver!: ResizeObserver;
  public originalSlidesCount: number = 0;
  private autoplayTimer: number | null = null;
  private isFirstInit = true;
  private lastContainerWidth = 0;

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
      "auto-width",
      "per-move",
      "auto-height",
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
      const currentWidth = this.getBoundingClientRect().width;
      if (currentWidth !== this.lastContainerWidth) {
        this.lastContainerWidth = currentWidth;
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
    const parsedInterval = intervalAttr !== null ? Number(intervalAttr) : 3000;

    const startAttr = this.getAttribute("start-index");
    const parsedStartIndex = startAttr !== null ? Number(startAttr) : 0;

    const perMoveAttr = this.getAttribute("per-move");
    let parsedPerMove: "auto" | number = "auto";
    if (perMoveAttr !== null && perMoveAttr !== "auto") {
      const num = Number(perMoveAttr);
      parsedPerMove = isNaN(num) ? "auto" : num;
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
      interval: isNaN(parsedInterval) ? 3000 : parsedInterval,
      startIndex: isNaN(parsedStartIndex) ? 0 : parsedStartIndex,
      autoWidth: this.hasAttribute("auto-width"),
      perMove: parsedPerMove,
      autoHeight: this.hasAttribute("auto-height"),
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

    const cloneCount = this.options.autoWidth
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
        const currentCloneCount = this.options.autoWidth
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
      !this.options.autoWidth &&
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

    const containerWidth = this.getBoundingClientRect().width;
    const gapPx = this.convertToPx(this.options.gap);
    const leftPadPx = this.convertToPx(this.options.leftPadding);
    const rightPadPx = this.convertToPx(this.options.rightPadding);

    if (this.options.autoWidth) {
      slides.forEach((slide) => {
        slide.style.width = "max-content";
      });

      this.track.offsetHeight;

      slides.forEach((slide) => {
        const child = slide.firstElementChild as HTMLElement;
        if (child) {
          slide.style.width = `${child.getBoundingClientRect().width}px`;
        } else {
          slide.style.width = "max-content";
        }
        slide.style.marginRight = this.options.gap;
      });

      this.options.perView = this.getVisibleSlidesCount();
    } else {
      const availableWidth =
        containerWidth -
        leftPadPx -
        rightPadPx -
        gapPx * (this.options.perView - 1);
      const slideWidth = availableWidth / this.options.perView;

      slides.forEach((slide) => {
        slide.style.width = `${slideWidth}px`;
        slide.style.marginRight = this.options.gap;
      });
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

  public getSlideWidthWithGap(): number {
    if (!this.track || this.track.children.length === 0) return 0;
    const firstSlide = this.track.children[0] as HTMLElement;
    return (
      firstSlide.getBoundingClientRect().width +
      this.convertToPx(this.options.gap)
    );
  }

  private getVisibleSlidesCount(): number {
    if (!this.track || this.track.children.length === 0) return 1;
    const containerW = this.getBoundingClientRect().width;
    let accumulatedWidth = 0;
    let count = 0;
    const gapPx = this.convertToPx(this.options.gap);
    const slides = Array.from(this.track.children) as HTMLElement[];

    for (let i = 0; i < slides.length; i++) {
      accumulatedWidth += slides[i].getBoundingClientRect().width + gapPx;
      if (accumulatedWidth - gapPx > containerW) break;
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
        offset += slides[i].getBoundingClientRect().width + gapPx;
      }
    }
    return offset;
  }

  public getMaxTranslate(): number {
    if (!this.track || this.track.children.length === 0) return 0;
    const containerWidth = this.getBoundingClientRect().width;

    let totalTrackWidth = 0;
    if (this.options.autoWidth) {
      totalTrackWidth = this.getOffsetForIndex(this.track.children.length);
      totalTrackWidth -= this.convertToPx(this.options.gap);
    } else {
      const totalSlides = this.track.children.length;
      const slideWidth = this.getSlideWidthWithGap();
      totalTrackWidth =
        slideWidth * totalSlides - this.convertToPx(this.options.gap);
    }

    return Math.max(0, totalTrackWidth - containerWidth);
  }

  public updateSlideAttributes() {
    if (!this.track) return;

    const slides = Array.from(this.track.children) as HTMLElement[];
    if (slides.length === 0) return;

    const isLoop = this.options.loop;
    const realSlideCount = isLoop ? this.originalSlidesCount : slides.length;
    if (realSlideCount === 0) return;

    const cloneCount = isLoop
      ? this.options.autoWidth
        ? this.originalSlidesCount
        : this.options.perView
      : 0;

    slides.forEach((slide, index) => {
      slide.removeAttribute("sx-slide-active");
      slide.removeAttribute("sx-slide-prev");
      slide.removeAttribute("sx-slide-next");

      let realIndex = index;
      if (isLoop) {
        realIndex = (index - cloneCount) % realSlideCount;
        if (realIndex < 0) realIndex += realSlideCount;
      }
      slide.setAttribute("aria-label", `${realIndex + 1}/${realSlideCount}`);
    });

    const activeIdx = this.currentIndex;
    const prevIdx = activeIdx - 1;
    const nextIdx = activeIdx + 1;

    if (slides[activeIdx])
      slides[activeIdx].setAttribute("sx-slide-active", "");
    if (slides[prevIdx]) slides[prevIdx].setAttribute("sx-slide-prev", "");
    if (slides[nextIdx]) slides[nextIdx].setAttribute("sx-slide-next", "");

    this.updateAutoHeight();
  }

public updateAutoHeight() {
    if (!this.track) return;

    // BẮT ĐẦU FIX: Xóa bỏ điều kiện chặn perView !== 1 
    if (!this.options.autoHeight) {
      this.style.height = "";
      this.style.transition = "";
      this.track.style.alignItems = ""; // Trả track về mặc định
      return;
    }

    // Ngăn các slide bị kéo giãn (stretch) biến dạng theo container [cite: 1109, 1110]
    this.track.style.alignItems = "flex-start";

    const slides = Array.from(this.track.children) as HTMLElement[];
    if (slides.length === 0) return;

    let maxHeight = 0;
    // Số lượng slide đang hiển thị (đã được tự động xử lý sẵn cho cả chế độ autoWidth ở hàm updateLayout)
    const visibleCount = this.options.perView; 

    // Quét qua tất cả các slide CÓ MẶT trên màn hình hiện tại
    for (let i = 0; i < visibleCount; i++) {
      const slideIndex = this.currentIndex + i;
      const slide = slides[slideIndex];

      if (slide) {
        // Lấy chiều cao nội dung thật của thẻ con trực tiếp (VD: <div class="slide">) [cite: 1090]
        const child = slide.firstElementChild as HTMLElement;
        const height = child
          ? child.getBoundingClientRect().height
          : slide.getBoundingClientRect().height;

        // Lưu lại chiều cao lớn nhất
        if (height > maxHeight) {
          maxHeight = height;
        }
      }
    }

    // Áp dụng chiều cao lớn nhất vừa tìm được cho Slider
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
    const minBound = -this.getMaxTranslate();
    const totalSlides = this.track.children.length;

    for (let i = 0; i < totalSlides; i++) {
      const offset = -this.getOffsetForIndex(i);
      if (offset <= minBound) {
        return i;
      }
    }
    return Math.max(0, totalSlides - 1);
  }

  private getResolvedPerMove(): number {
    if (this.options.perMove === "auto") {
      return 1;
    }

    const visibleSlides = this.getVisibleSlidesCount();
    let val = Math.max(1, this.options.perMove);
    return Math.min(val, visibleSlides);
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
    const leftPadPx = parseFloat(this.options.leftPadding) || 0;

    const shiftedTranslate = translate - leftPadPx;

    if (shiftedTranslate > 0) {
      this.currentIndex = 0;
    } else {
      const targetTranslate = Math.abs(shiftedTranslate);

      if (this.options.autoWidth && this.track) {
        const slides = Array.from(this.track.children) as HTMLElement[];
        const gapPx = this.convertToPx(this.options.gap);
        let accumulated = 0;
        let foundIndex = 0;

        for (let i = 0; i < slides.length; i++) {
          const w = slides[i].getBoundingClientRect().width + gapPx;
          if (accumulated + w / 2 > targetTranslate) {
            foundIndex = i;
            break;
          }
          accumulated += w;
          foundIndex = i;
        }
        this.currentIndex = foundIndex;
      } else {
        const slideWidth = this.getSlideWidthWithGap();
        this.currentIndex = Math.round(targetTranslate / slideWidth);
      }
    }

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
