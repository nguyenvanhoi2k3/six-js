import { sliderRegistry } from './slider-registry';

export class SxSliderPrev extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', () => this.handleAction());
    
    this.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleAction();
      }
    });
  }

  connectedCallback() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'button');
    }
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Previous slide');
    }
  }

  private handleAction() {
    if (this.hasAttribute('sx-disabled')) return;

    const name = this.getAttribute('name');
    if (name) {
      const targetSlider = sliderRegistry.get(name);
      if (targetSlider) targetSlider.prev();
    } else {
      const parentSlider = this.closest('sx-slider');
      if (parentSlider) (parentSlider as any).prev();
    }
  }
}

if (!customElements.get('sx-slider-prev')) {
  customElements.define('sx-slider-prev', SxSliderPrev);
}