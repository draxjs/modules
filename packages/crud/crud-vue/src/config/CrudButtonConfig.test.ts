import {describe, expect, it} from "vitest";

describe("CrudButtonConfig", () => {
    it("shares config between duplicated module instances", async () => {
        const first = await import("./CrudButtonConfig");
        const duplicatedModulePath = "./CrudButtonConfig?duplicated";
        const second = await import(duplicatedModulePath) as typeof import("./CrudButtonConfig");

        first.resetCrudButtonsConfig();
        first.configureCrudButtons({
            defaults: {
                variant: "elevated",
                rounded: 0,
                color: "deep-purple-accent-4",
            },
            buttons: {
                create: {
                    icon: "md:add_circle",
                    color: "green-accent-4",
                },
            },
        });

        expect(second.getCrudButtonConfig("create")).toMatchObject({
            icon: "md:add_circle",
            variant: "elevated",
            rounded: 0,
            color: "green-accent-4",
        });

        first.resetCrudButtonsConfig();
    });
});
