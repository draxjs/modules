import { describe, expect, it } from "vitest";
import { z } from "zod";

import { CrudSchemaBuilder } from "../src/builders/CrudSchemaBuilder.js";

describe("CrudSchemaBuilder", () => {
  it("adapts date fields inside object arrays wrapped with defaults", () => {
    const CountryBaseSchema = z.object({
      name: z.string().min(1, "validation.required"),
      notes: z
        .array(
          z.object({
            date: z.coerce.date().nullable().optional(),
            note: z.string().optional().default("")
          })
        )
        .optional()
        .default([])
    });

    const builder = new CrudSchemaBuilder(
      CountryBaseSchema,
      CountryBaseSchema,
      CountryBaseSchema,
      "Country"
    );

    expect(() => builder.jsonEntityCreateSchema).not.toThrow();
    expect(builder.jsonEntityCreateSchema).toMatchObject({
      properties: {
        notes: {
          type: "array",
          default: []
        }
      }
    });
  });
});
