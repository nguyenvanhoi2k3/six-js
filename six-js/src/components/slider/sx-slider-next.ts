import { sliderRegistry } from './slider-registry';

export class SxSliderNext extends HTMLElement {
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
      this.setAttribute('aria-label', 'Next slide');
    }
  }

  private handleAction() {
    if (this.hasAttribute('sx-disabled')) return;

    const name = this.getAttribute('name');
    if (name) {
      const targetSlider = sliderRegistry.get(name);
      if (targetSlider) targetSlider.next();
    } else {
      const parentSlider = this.closest('sx-slider');
      if (parentSlider) (parentSlider as any).next();
    }
  }
}

if (!customElements.get('sx-slider-next')) {
  customElements.define('sx-slider-next', SxSliderNext);
}