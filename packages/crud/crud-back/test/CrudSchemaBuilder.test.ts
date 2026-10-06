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

  it("adapts preprocessed optional nullable date fields", () => {
    const optionalNullableDateSchema = z.preprocess(value => {
      if (value === "" || value === 0 || value === "0") {
        return null;
      }

      return value;
    }, z.coerce.date().nullable().optional());

    const TaskScheduleBaseSchema = z.object({
      name: z.string().min(1, "validation.required"),
      schedule: z.object({
        timezone: z.string()
          .default("America/Argentina/Buenos_Aires")
          .refine(value => value.length > 0, "validation.timezone.invalid"),
        runAt: optionalNullableDateSchema
      }),
      startAt: optionalNullableDateSchema,
      endAt: optionalNullableDateSchema
    });

    const builder = new CrudSchemaBuilder(
      TaskScheduleBaseSchema,
      TaskScheduleBaseSchema,
      TaskScheduleBaseSchema,
      "TaskSchedule"
    );

    expect(() => builder.jsonEntityCreateSchema).not.toThrow();
    expect(builder.jsonEntityCreateSchema).toMatchObject({
      properties: {
        schedule: {
          properties: {
            runAt: {
              type: "string",
              format: "date-time",
              nullable: true
            }
          }
        },
        startAt: {
          type: "string",
          format: "date-time",
          nullable: true
        }
      }
    });
  });
});
