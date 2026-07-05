// six-js\src\components\slider\slider-pagination.ts
import { sliderRegistry } from "./slider-registry";

export class SxSliderPagination extends HTMLElement {
  private renderedSignature = "";
  private innerContainer: HTMLDivElement | null = null;
  private snakeBar: HTMLDivElement | null = null;

  private maxVisibleBullets = 5;
  private bulletWidthWithGap = 16;
  private lastActiveIndex = 0;
  private cachedBullets: HTMLElement[] = [];
  private snakeTimeout: number | null = null;

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
    const isFraction = effect === "fraction";

    const signature = bulletIndexes.join(",") + `_effect:${effect}`;
    if (this.renderedSignature === signature) return;
    this.renderedSignature = signature;

    this.innerHTML = "";
    this.snakeBar = null;
    this.cachedBullets = [];

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

      const fragment = document.createDocumentFragment();
      fragment.appendChild(currentSpan);
      fragment.appendChild(separator);
      fragment.appendChild(totalSpan);
      this.appendChild(fragment);
      return;
    }

    const fragment = document.createDocumentFragment();

    if (isSnake) {
      this.innerContainer = null;
      this.style.width = "";
      this.style.position = "relative";

      bulletIndexes.forEach((targetIndex, i) => {
        const bullet = this.createBulletDOM(targetIndex, i, false);
        this.cachedBullets.push(bullet);
        fragment.appendChild(bullet);
      });

      this.snakeBar = document.createElement("div");
      this.snakeBar.className = "sx-slider-pagination-bar";
      this.snakeBar.style.position = "absolute";
      this.snakeBar.style.zIndex = "10";
      this.snakeBar.style.transition =
        "width 150ms ease-out, left 150ms ease-out";

      fragment.appendChild(this.snakeBar);
      this.appendChild(fragment);
      return;
    }

    if (isDynamic) {
      this.innerContainer = document.createElement("div");
      this.innerContainer.className = "sx-slider-pagination-inner";
      fragment.appendChild(this.innerContainer);

      bulletIndexes.forEach((targetIndex, i) => {
        const bullet = this.createBulletDOM(targetIndex, i, false);
        this.cachedBullets.push(bullet);
        this.innerContainer!.appendChild(bullet);
      });

      if (bulletIndexes.length > this.maxVisibleBullets) {
        this.style.width = `${this.maxVisibleBullets * this.bulletWidthWithGap}px`;
      } else {
        this.style.width = "auto";
      }
      
      this.appendChild(fragment);
      return;
    }

    this.innerContainer = null;
    this.style.width = "";

    bulletIndexes.forEach((targetIndex, i) => {
      const bullet = this.createBulletDOM(targetIndex, i, effect === "number");
      this.cachedBullets.push(bullet);
      fragment.appendChild(bullet);
    });
    
    this.appendChild(fragment);
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

    if (effect === "fraction") {
      const currentSpan = this.querySelector(".sx-slider-pagination-current");
      if (currentSpan) {
        currentSpan.textContent = (activeIndex + 1).toString();
      }
      return;
    }

    const isDynamic = effect === "dynamic";
    const isSnake = effect === "snake";

    const bullets = this.cachedBullets;
    const total = bullets.length;
    if (total === 0) return;

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

    if (isSnake && this.snakeBar) {
      if (this.snakeTimeout !== null) {
        clearTimeout(this.snakeTimeout);
        this.snakeTimeout = null;
      }

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

          this.snakeTimeout = window.setTimeout(() => {
            if (this.getAttribute("effect") === "snake" && this.snakeBar) {
              this.snakeBar.style.left = `${currentLeft}px`;
              this.snakeBar.style.width = `${bulletSize}px`;
            }
          }, 150);
        } else if (activeIndex < this.lastActiveIndex) {
          const widthSpan = previousLeft - currentLeft + bulletSize;
          this.snakeBar.style.left = `${currentLeft}px`;
          this.snakeBar.style.width = `${widthSpan}px`;

          this.snakeTimeout = window.setTimeout(() => {
            if (this.getAttribute("effect") === "snake" && this.snakeBar) {
              this.snakeBar.style.width = `${bulletSize}px`;
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

    if (!isDynamic || total <= this.maxVisibleBullets || !this.innerContainer) {
      if (this.innerContainer) {
        this.innerContainer.style.transform = "translateX(0px)";
      }
      return;
    }

    let startIdx = Math.max(0, activeIndex - Math.floor(this.maxVisibleBullets / 2));
    startIdx = Math.min(startIdx, total - this.maxVisibleBullets);

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