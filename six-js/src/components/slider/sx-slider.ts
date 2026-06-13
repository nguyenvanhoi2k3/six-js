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
  private isFirstHeightMeasure = true;

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
      "centered",
      "auto-centered",
      "center-if-short",
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
      centered: this.hasAttribute("centered"),
      autoCentered: this.hasAttribute("auto-centered"),
      centerIfShort: this.hasAttribute("center-if-short"),
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

// --- BẮT ĐẦU THÊM: CENTER-IF-SHORT ---
    let isShort = false;
    // Lọc ra các slide gốc (không tính bản clone)
    const realSlides = slides.filter((s) => !s.hasAttribute("data-clone"));

    if (this.options.autoWidth) {
      // Đo tổng chiều rộng thực tế của các slide gốc
      let totalW = 0;
      realSlides.forEach((s) => {
        totalW += s.getBoundingClientRect().width + gapPx;
      });
      totalW -= gapPx;
      isShort = totalW < containerWidth;
    } else {
      // Ở chế độ chia cột bình thường, đếm số lượng so với perView
      isShort = realSlideCount < this.options.perView;
    }

    if (this.options.centerIfShort && isShort) {
      // Ép các thẻ con vào giữa track
      this.track.style.justifyContent = "center";
      
      // (Tùy chọn an toàn) Nếu bật loop nhưng số slide quá ít, ta dọn dẹp các bản clone 
      // để tránh việc giao diện bị lặp rác và mất đi trạng thái căn giữa.
      if (this.options.loop) {
        const clones = this.track.querySelectorAll("[data-clone]");
        clones.forEach((c) => c.remove());
      }
    } else {
      // Trả track về mặc định (căn trái)
      this.track.style.justifyContent = "";
    }
    // --- KẾT THÚC: CENTER-IF-SHORT ---

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

  // Trả về ranh giới trượt chính xác dựa trên cấu hình centered / auto-centered
  public getBoundaries(): { max: number; min: number } {
    if (!this.track || this.track.children.length === 0)
      return { max: 0, min: 0 };

    const containerWidth = this.getBoundingClientRect().width;
    const leftPadPx = parseFloat(this.options.leftPadding) || 0;
    const gapPx = this.convertToPx(this.options.gap);
    const totalSlides = this.track.children.length;

    let maxBound = 0;
    let minBound = -this.getMaxTranslate();

    if (this.options.centered && !this.options.autoCentered) {
      // Tọa độ lớn nhất khi kéo thẻ đầu tiên ra giữa màn hình
      let firstSlideW = this.options.autoWidth
        ? (this.track.children[0]?.getBoundingClientRect().width || 0) + gapPx
        : this.getSlideWidthWithGap();
      maxBound = leftPadPx + containerWidth / 2 - firstSlideW / 2;

      // Tọa độ nhỏ nhất khi kéo thẻ cuối cùng ra giữa màn hình
      let lastIdx = totalSlides - 1;
      let offsetToLeft = this.options.autoWidth
        ? this.getOffsetForIndex(lastIdx)
        : lastIdx * this.getSlideWidthWithGap();
      let lastSlideW = this.options.autoWidth
        ? (this.track.children[lastIdx]?.getBoundingClientRect().width || 0) +
          gapPx
        : this.getSlideWidthWithGap();
      minBound =
        leftPadPx + containerWidth / 2 - (offsetToLeft + lastSlideW / 2);
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
      ? this.options.autoWidth
        ? this.originalSlidesCount
        : this.options.perView
      : 0;

    const getRealIdx = (idx: number) => {
      if (!isLoop) return idx;
      let rIdx = (idx - cloneCount) % realSlideCount;
      if (rIdx < 0) rIdx += realSlideCount;
      return rIdx;
    };

    // --- BẮT ĐẦU CẬP NHẬT: Thêm logic tính toán chỉ số trung tâm ---
    // Tìm ra "độ lệch" (offset) tới slide ở giữa dựa vào perView
    // VD: perView = 3 -> lệch 1. perView = 5 -> lệch 2. perView = 1 -> lệch 0.
    const centerOffset = this.options.centered ? 0 : Math.floor(this.options.perView / 2);

    const targetActiveReal = getRealIdx(this.currentIndex);
    const targetPrevReal = getRealIdx(this.currentIndex - 1);
    const targetNextReal = getRealIdx(this.currentIndex + 1);
    // Tính toán realIndex của slide nằm chính giữa màn hình
    const targetCenterReal = getRealIdx(this.currentIndex + centerOffset);
    // --- KẾT THÚC CẬP NHẬT ---

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
      slide.removeAttribute("sx-slide-center"); // Nhớ xóa attribute cũ đi nhé

      let realIndex = getRealIdx(index);
      slide.setAttribute("aria-label", `${realIndex + 1}/${realSlideCount}`);

      if (realIndex === targetActiveReal)
        slide.setAttribute("sx-slide-active", "");
      if (realIndex === targetPrevReal) slide.setAttribute("sx-slide-prev", "");
      if (realIndex === targetNextReal) slide.setAttribute("sx-slide-next", "");

      // Gắn attribute cho slide trung tâm (bao gồm cả bản gốc và clone)
      if (realIndex === targetCenterReal)
        slide.setAttribute("sx-slide-center", "");
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

    this.track.style.alignItems = "flex-start";

    const slides = Array.from(this.track.children) as HTMLElement[];
    if (slides.length === 0) return;

    let maxHeight = 0;
    const visibleCount = this.options.perView;

    for (let i = 0; i < visibleCount; i++) {
      const slideIndex = this.currentIndex + i;
      const slide = slides[slideIndex];

      if (slide) {
        // --- BẮT ĐẦU FIX: Kỹ Thuật "Clone & Measure" ---
        // Tạo một bản sao vô hình để ép trình duyệt tính toán đích đến (Target Height)
        // mà không làm gián đoạn hay ảnh hưởng tới CSS transition đang chạy trên thẻ thật.
        const clone = slide.cloneNode(true) as HTMLElement;
        clone.style.position = "absolute";
        clone.style.visibility = "hidden";
        clone.style.pointerEvents = "none";
        clone.style.transition = "none";

        // Khóa cứng chiều rộng để nội dung text bên trong không bị rớt dòng sai lệch
        clone.style.width = `${slide.getBoundingClientRect().width}px`;

        const cloneChild = clone.firstElementChild as HTMLElement;
        if (cloneChild) {
          cloneChild.style.transition = "none"; // Bóp chết transition của thẻ con
        }

        // Tạm thời gắn vào track để mượn context CSS hiện tại
        this.track.appendChild(clone);

        // Đo đạc kích thước từ bản clone (Lúc này chắc chắn trả về 800px tuyệt đối)
        const height = cloneChild
          ? cloneChild.getBoundingClientRect().height
          : clone.getBoundingClientRect().height;

        if (height > maxHeight) {
          maxHeight = height;
        }

        // Đo xong thì hủy phi tang ngay lập tức (Trình duyệt chưa kịp vẽ ra màn hình)
        this.track.removeChild(clone);
        // --- KẾT THÚC FIX ---
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
      let offsetToLeft = this.options.autoWidth
        ? this.getOffsetForIndex(i)
        : i * this.getSlideWidthWithGap();
      let currentSlideW = this.options.autoWidth
        ? this.track.children[i].getBoundingClientRect().width +
          this.convertToPx(this.options.gap)
        : this.getSlideWidthWithGap();

      let expectedTranslate = parseFloat(this.options.leftPadding) || 0;
      if (this.options.centered) {
        const containerWidth = this.getBoundingClientRect().width;
        expectedTranslate +=
          containerWidth / 2 - (offsetToLeft + currentSlideW / 2);
      } else {
        expectedTranslate -= offsetToLeft;
      }

      // Dung sai +1px để chống sai số hệ phân thập phân
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
    if (!this.track) return;
    const leftPadPx = parseFloat(this.options.leftPadding) || 0;
    const containerWidth = this.getBoundingClientRect().width;
    const slides = Array.from(this.track.children) as HTMLElement[];
    const gapPx = this.convertToPx(this.options.gap);

    let closestIndex = 0;
    let minDiff = Infinity;
    const currentActive = this.currentIndex; // Lưu trạng thái hiện tại để phân xử

    for (let i = 0; i < slides.length; i++) {
      let offsetToLeft = 0;
      let currentSlideW = 0;

      if (this.options.autoWidth) {
        offsetToLeft = this.getOffsetForIndex(i);
        currentSlideW = slides[i].getBoundingClientRect().width + gapPx;
      } else {
        const slideWidth = this.getSlideWidthWithGap();
        offsetToLeft = i * slideWidth;
        currentSlideW = slideWidth;
      }

      let expectedTranslate = leftPadPx;

      if (this.options.centered) {
        expectedTranslate +=
          containerWidth / 2 - (offsetToLeft + currentSlideW / 2);
      } else {
        expectedTranslate -= offsetToLeft;
      }

      if (!this.options.loop) {
        const { max: maxBound, min: minBound } = this.getBoundaries();
        if (this.options.centered && this.options.autoCentered) {
          // Ép không cho sinh ra khoảng trắng ở mép
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

      // --- BẮT ĐẦU FIX: Phân xử hòa (Tie-breaker) ---
      if (diff < minDiff - 0.5) {
        minDiff = diff;
        closestIndex = i;
      } else if (Math.abs(diff - minDiff) <= 0.5) {
        // Khi tọa độ của nhiều thẻ bị ép trùng nhau (do auto-centered),
        // ưu tiên index nằm gần trạng thái của ngón tay hiện tại nhất!
        if (Math.abs(i - currentActive) < Math.abs(closestIndex - currentActive)) {
          closestIndex = i;
          minDiff = diff;
        }
      }
      // --- KẾT THÚC FIX ---
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
