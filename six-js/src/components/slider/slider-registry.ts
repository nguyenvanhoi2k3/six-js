import { SxSlider } from './sx-slider';

class SliderRegistry {
  private sliders = new Map<string, SxSlider>();

  register(name: string, instance: SxSlider) {
    this.sliders.set(name, instance);
  }

  unregister(name: string) {
    this.sliders.delete(name);
  }

  get(name: string): SxSlider | undefined {
    return this.sliders.get(name);
  }
}

export const sliderRegistry = new SliderRegistry();