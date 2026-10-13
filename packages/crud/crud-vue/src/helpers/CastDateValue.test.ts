import {describe, expect, it} from "vitest";
import {castDateValue} from "./CastDateValue";

describe("castDateValue", () => {
    it("casts empty values to null", () => {
        expect(castDateValue(null)).toBeNull()
        expect(castDateValue(undefined)).toBeNull()
        expect(castDateValue('')).toBeNull()
    })

    it("keeps existing Date instances", () => {
        const date = new Date('2026-10-01T03:00:00.000Z')

        expect(castDateValue(date)).toBe(date)
    })

    it("casts valid date strings to Date instances", () => {
        const date = new Date('2026-10-01T03:00:00.000Z')

        expect(castDateValue('2026-10-01T03:00:00.000Z')).toEqual(date)
    })

    it.each(['invalid-date', {}, [], false, true, new Date(NaN)])("casts invalid date values to null: %s", (value) => {
        expect(castDateValue(value)).toBeNull()
    })

    it("casts numeric timestamps without treating zero as empty", () => {
        expect(castDateValue(0)).toEqual(new Date(0))
    })
})
