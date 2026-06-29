// six-js\src\components\slider\sx-slider-pagination.ts
import { sliderRegistry } from "./slider-registry";

export class SxSliderPagination extends HTMLElement {
  private renderedSignature = "";
  private innerContainer: HTMLDivElement | null = null;
  private snakeBar: HTMLDivElement | null = null;

  private maxVisibleBullets = 5;
  private bulletWidthWithGap = 16;
  private lastActiveIndex = 0;

  constructor() {
    super();
    this.addEventListener("click", (e) => this.handleAction(e));

    this.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.handleAction(e);
      }
    });
  }

  static get observedAttributes() {
    return ["effect", "name"];
  }

  attributeChangedCallback() {
    this.renderedSignature = "";
  }

  private handleAction(e: Event) {
    const target = e.target as HTMLElement;
    if (target.classList.contains("sx-slider-pagination-bullet")) {
      const index = Number(target.getAttribute("data-index"));
      this.goToSlide(index);
    }
  }

  private goToSlide(index: number) {
    const name = this.getAttribute("name");
    let slider: any = null;

    if (name) {
      slider = sliderRegistry.get(name);
    } else {
      slider = this.closest("sx-slider");
    }

    if (slider && typeof slider.goTo === "function") {
      slider.goTo(index);
    }
  }

  public renderBullets(bulletIndexes: number[]) {
    const effect = this.getAttribute("effect");
    const isDynamic = effect === "dynamic";
    const isSnake = effect === "snake";
    const isNumber = effect === "number";
    const isFraction = effect === "fraction"; // <-- Thêm khai báo fraction

    const signature = bulletIndexes.join(",") + `_effect:${effect}`;
    if (this.renderedSignature === signature) return;
    this.renderedSignature = signature;

    this.innerHTML = "";
    this.snakeBar = null;

    // --- CASE 1: FRACTION EFFECT ---
    if (isFraction) {
      this.innerContainer = null;
      this.style.width = "";

      const currentSpan = document.createElement("span");
      currentSpan.className = "sx-slider-pagination-current";
      currentSpan.textContent = "1";

      const separator = document.createTextNode(" / ");

      const totalSpan = document.createElement("span");
      totalSpan.className = "sx-slider-pagination-total";
      totalSpan.textContent = bulletIndexes.length.toString();

      this.appendChild(currentSpan);
      this.appendChild(separator);
      this.appendChild(totalSpan);
      return;
    }

    // --- CASE 2: SNAKE EFFECT ---
    if (isSnake) {
      this.innerContainer = null;
      this.style.width = "";
      this.style.position = "relative";

      bulletIndexes.forEach((targetIndex, i) => {
        this.appendChild(this.createBulletDOM(targetIndex, i, false));
      });

      this.snakeBar = document.createElement("div");
      this.snakeBar.className = "sx-slider-pagination-bar";
      this.snakeBar.style.position = "absolute";
      this.snakeBar.style.zIndex = "10";
      this.snakeBar.style.transition =
        "width 150ms ease-out, left 150ms ease-out";

      this.appendChild(this.snakeBar);
      return;
    }

    // --- CASE 3: DYNAMIC EFFECT ---
    if (isDynamic) {
      this.innerContainer = document.createElement("div");
      this.innerContainer.className = "sx-slider-pagination-inner";
      this.appendChild(this.innerContainer);

      bulletIndexes.forEach((targetIndex, i) => {
        this.innerContainer!.appendChild(
          this.createBulletDOM(targetIndex, i, false),
        );
      });

      if (bulletIndexes.length > this.maxVisibleBullets) {
        this.style.width = `${this.maxVisibleBullets * this.bulletWidthWithGap}px`;
      } else {
        this.style.width = "auto";
      }
      return;
    }

    // --- CASE 4: NUMBER EFFECT Hoặc DEFAULT ---
    this.innerContainer = null;
    this.style.width = "";

    bulletIndexes.forEach((targetIndex, i) => {
      this.appendChild(this.createBulletDOM(targetIndex, i, isNumber));
    });
  }

  private createBulletDOM(
    targetIndex: number,
    labelIndex: number,
    appendNumber: boolean,
  ): HTMLSpanElement {
    const bullet = document.createElement("span");
    bullet.className = "sx-slider-pagination-bullet";
    bullet.setAttribute("data-index", targetIndex.toString());
    bullet.setAttribute("role", "button");
    bullet.setAttribute("tabindex", "0");
    bullet.setAttribute("aria-label", `Go to slide ${labelIndex + 1}`);

    if (appendNumber) {
      bullet.textContent = (labelIndex + 1).toString();
    }

    return bullet;
  }

  public updateActive(activeIndex: number) {
    const effect = this.getAttribute("effect");
    const isFraction = effect === "fraction"; // <-- Thêm khai báo fraction

    // Xử lý hiệu ứng FRACTION trước tiên vì nó không dùng DOM class `.sx-slider-pagination-bullet`
    if (isFraction) {
      const currentSpan = this.querySelector(".sx-slider-pagination-current");
      if (currentSpan) {
        currentSpan.textContent = (activeIndex + 1).toString();
      }
      return;
    }

    const isDynamic = effect === "dynamic";
    const isSnake = effect === "snake";

    const targetContainer = isDynamic ? this.innerContainer : this;
    if (!targetContainer) return;

    const bullets = Array.from(
      targetContainer.querySelectorAll(".sx-slider-pagination-bullet"),
    ) as HTMLElement[];
    const total = bullets.length;
    if (total === 0) return;

    // 1. Đồng bộ thuộc tính active cho toàn bộ bullet
    bullets.forEach((b, i) => {
      if (isDynamic) b.className = "sx-slider-pagination-bullet";

      if (i === activeIndex) {
        b.setAttribute("sx-bullet-active", "");
        b.setAttribute("aria-current", "true");
      } else {
        b.removeAttribute("sx-bullet-active");
        b.removeAttribute("aria-current");
      }
    });

    // 2. Xử lý hiệu ứng SNAKE
    if (isSnake && this.snakeBar) {
      const activeBullet = bullets[activeIndex];
      if (activeBullet) {
        const bulletSize = 10;
        const gap = 10;
        const step = bulletSize + gap;

        const currentLeft = activeIndex * step;
        const previousLeft = this.lastActiveIndex * step;

        if (activeIndex > this.lastActiveIndex) {
          const widthSpan = currentLeft - previousLeft + bulletSize;
          this.snakeBar.style.left = `${previousLeft}px`;
          this.snakeBar.style.width = `${widthSpan}px`;

          setTimeout(() => {
            if (this.getAttribute("effect") === "snake") {
              this.snakeBar!.style.left = `${currentLeft}px`;
              this.snakeBar!.style.width = `${bulletSize}px`;
            }
          }, 150);
        } else if (activeIndex < this.lastActiveIndex) {
          const widthSpan = previousLeft - currentLeft + bulletSize;
          this.snakeBar.style.left = `${currentLeft}px`;
          this.snakeBar.style.width = `${widthSpan}px`;

          setTimeout(() => {
            if (this.getAttribute("effect") === "snake") {
              this.snakeBar!.style.width = `${bulletSize}px`;
            }
          }, 150);
        } else {
          this.snakeBar.style.left = `${currentLeft}px`;
          this.snakeBar.style.width = `${bulletSize}px`;
        }
      }
      this.lastActiveIndex = activeIndex;
      return;
    }

    // 3. Xử lý hiệu ứng DYNAMIC
    if (!isDynamic || total <= this.maxVisibleBullets || !this.innerContainer) {
      if (this.innerContainer)
        this.innerContainer.style.transform = "translateX(0px)";
      return;
    }

    let startIdx = activeIndex - Math.floor(this.maxVisibleBullets / 2);
    if (startIdx < 0) startIdx = 0;
    if (startIdx > total - this.maxVisibleBullets)
      startIdx = total - this.maxVisibleBullets;

    const endIdx = startIdx + this.maxVisibleBullets - 1;

    bullets.forEach((b, i) => {
      if (i >= startIdx && i <= endIdx) {
        if (i === startIdx) {
          b.classList.add(i === 0 ? "sx-bullet-main" : "sx-bullet-small");
        } else if (i === startIdx + 1) {
          b.classList.add(i === 1 ? "sx-bullet-main" : "sx-bullet-medium");
        } else if (i === endIdx) {
          b.classList.add(
            i === total - 1 ? "sx-bullet-main" : "sx-bullet-small",
          );
        } else if (i === endIdx - 1) {
          b.classList.add(
            i === total - 2 ? "sx-bullet-main" : "sx-bullet-medium",
          );
        } else {
          b.classList.add("sx-bullet-main");
        }
      } else {
        b.classList.add("sx-bullet-small");
      }
    });

    const translateX = -startIdx * this.bulletWidthWithGap;
    this.innerContainer.style.transform = `translateX(${translateX}px)`;
  }
}

if (!customElements.get("sx-slider-pagination")) {
  customElements.define("sx-slider-pagination", SxSliderPagination);
}