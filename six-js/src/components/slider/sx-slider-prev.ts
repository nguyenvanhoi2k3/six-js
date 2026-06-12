import { sliderRegistry } from './slider-registry';

export class SxSliderPrev extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', () => this.handleAction());
  }

  private handleAction() {
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