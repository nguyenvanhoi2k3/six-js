import { sliderRegistry } from './slider-registry';

export class SxSliderNext extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', () => this.handleAction());
  }

  private handleAction() {
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