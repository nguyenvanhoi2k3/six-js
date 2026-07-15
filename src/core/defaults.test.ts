import { afterEach, describe, expect, it } from "vitest";
import { getDefaults, resetDefaults, setDefaults } from "./defaults";

describe("defaults", () => {
  afterEach(() => resetDefaults());

  it("starts with a sensible built-in duration/ease", () => {
    const d = getDefaults();
    expect(d.duration).toBe(0.8);
    expect(d.ease).toBe("smooth");
  });

  it("merges partial overrides on top of the existing defaults", () => {
    setDefaults({ duration: 1 });
    expect(getDefaults().duration).toBe(1);
    expect(getDefaults().ease).toBe("smooth");

    setDefaults({ ease: "cubicIn" });
    expect(getDefaults().duration).toBe(1);
    expect(getDefaults().ease).toBe("cubicIn");
  });
});
