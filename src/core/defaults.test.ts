import { afterEach, describe, expect, it } from "vitest";
import { getDefaults, resetDefaults, setDefaults } from "./defaults";

describe("defaults", () => {
  afterEach(() => resetDefaults());

  it("starts with a sensible built-in duration/ease", () => {
    const d = getDefaults();
    expect(d.duration).toBe(0.5);
    expect(d.ease).toBe("power1.out");
  });

  it("merges partial overrides on top of the existing defaults", () => {
    setDefaults({ duration: 1 });
    expect(getDefaults().duration).toBe(1);
    expect(getDefaults().ease).toBe("power1.out");

    setDefaults({ ease: "power2.in" });
    expect(getDefaults().duration).toBe(1);
    expect(getDefaults().ease).toBe("power2.in");
  });
});
