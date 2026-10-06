import {describe, expect, it} from "vitest";
import {normalizeFieldValue} from "./NormalizeFieldValue";

describe("normalizeFieldValue", () => {
  it("converts number field strings to numbers", () => {
    expect(normalizeFieldValue({type: "number"}, "42")).toBe(42);
  });

  it("converts empty number field values to null", () => {
    expect(normalizeFieldValue({type: "number"}, "")).toBeNull();
  });

  it("converts array.number item strings to numbers", () => {
    expect(normalizeFieldValue({type: "array.number"}, ["1", 2, "3"])).toEqual([1, 2, 3]);
  });

  it("leaves non-number fields unchanged", () => {
    expect(normalizeFieldValue({type: "string"}, "42")).toBe("42");
  });
});
