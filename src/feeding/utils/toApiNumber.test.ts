/// <reference types="jest" />

import { toApiNumber } from "./toApiNumber";

describe("toApiNumber", () => {
  it("passes finite numbers through", () => {
    expect(toApiNumber(85)).toBe(85);
    expect(toApiNumber(0)).toBe(0);
    expect(toApiNumber(-1.5)).toBe(-1.5);
  });

  it("parses the numeric strings the spec allows", () => {
    expect(toApiNumber("85")).toBe(85);
    expect(toApiNumber("4.1")).toBe(4.1);
    expect(toApiNumber(" 12 ")).toBe(12);
  });

  it("treats absent and blank values as no value", () => {
    expect(toApiNumber(null)).toBeNull();
    expect(toApiNumber(undefined)).toBeNull();
    expect(toApiNumber("")).toBeNull();
    expect(toApiNumber("   ")).toBeNull();
  });

  it("never returns NaN or Infinity", () => {
    expect(toApiNumber("abc")).toBeNull();
    expect(toApiNumber(Number.NaN)).toBeNull();
    expect(toApiNumber(Number.POSITIVE_INFINITY)).toBeNull();
    expect(toApiNumber("Infinity")).toBeNull();
  });

  it("reads the same value spelled as number and as string identically", () => {
    expect(toApiNumber(85)).toBe(toApiNumber("85"));
    expect(toApiNumber(4.1)).toBe(toApiNumber("4.1"));
  });

  it("reads a decimal comma, which a locale's number pad types", () => {
    expect(toApiNumber("4,5")).toBe(4.5);
    expect(toApiNumber("1,2,3")).toBeNull();
  });
});
