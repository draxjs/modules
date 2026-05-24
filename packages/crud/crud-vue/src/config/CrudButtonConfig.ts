import {computed, reactive} from "vue";

export type CrudButtonName =
    "ai"
    | "columns"
    | "create"
    | "createOnTheFly"
    | "delete"
    | "dialogNext"
    | "dialogPrev"
    | "export"
    | "filter"
    | "groupBy"
    | "import"
    | "openRouteForm"
    | "refresh"
    | "savedQueries"
    | "update"
    | "view";

export type CrudButtonRounded = boolean | string | number;
export type CrudButtonVariant = "flat" | "text" | "elevated" | "outlined" | "plain" | "tonal";

export interface CrudButtonStyle {
    icon?: string;
    activeIcon?: string;
    variant?: CrudButtonVariant;
    rounded?: CrudButtonRounded;
    color?: string;
}

export type CrudButtonGlobalStyle = Pick<CrudButtonStyle, "variant" | "rounded" | "color">;

export type CrudButtonsConfig = {
    defaults?: CrudButtonGlobalStyle;
    buttons?: Partial<Record<CrudButtonName, CrudButtonStyle>>;
};

const crudButtonDefaultStyles: Record<CrudButtonName, CrudButtonStyle> = {
    ai: {icon: "mdi-robot-outline", variant: "text"},
    columns: {icon: "mdi-view-column", variant: "text"},
    create: {icon: "mdi-plus", variant: "text"},
    createOnTheFly: {icon: "mdi-plus", variant: "text"},
    delete: {icon: "mdi-delete", variant: "text", color: "red"},
    dialogNext: {icon: "mdi-chevron-right", variant: "text"},
    dialogPrev: {icon: "mdi-chevron-left", variant: "text"},
    export: {icon: "mdi-database-export-outline", variant: "text"},
    filter: {icon: "mdi-filter", activeIcon: "mdi-filter-off", variant: "text"},
    groupBy: {icon: "mdi-chart-bar", variant: "text"},
    import: {icon: "mdi-database-import-outline", variant: "text"},
    openRouteForm: {icon: "mdi-open-in-new", variant: "text"},
    refresh: {icon: "mdi-refresh", variant: "text"},
    savedQueries: {icon: "mdi-content-save-cog", variant: "text"},
    update: {icon: "mdi-pencil", variant: "text", color: "blue"},
    view: {icon: "mdi-magnify", variant: "text", color: "teal"},
};

const crudButtonsConfigGlobalKey = "__draxCrudVueCrudButtonsConfig";

type CrudButtonsConfigGlobal = typeof globalThis & {
    [crudButtonsConfigGlobalKey]?: Required<CrudButtonsConfig>;
};

function createCrudButtonsConfig(): Required<CrudButtonsConfig> {
    return reactive<Required<CrudButtonsConfig>>({
        defaults: {},
        buttons: {},
    });
}

const crudButtonsConfigGlobal = globalThis as CrudButtonsConfigGlobal;
const crudButtonsConfig = crudButtonsConfigGlobal[crudButtonsConfigGlobalKey]
    || (crudButtonsConfigGlobal[crudButtonsConfigGlobalKey] = createCrudButtonsConfig());

export function configureCrudButtons(config: CrudButtonsConfig) {
    if (config.defaults) {
        Object.assign(crudButtonsConfig.defaults, config.defaults);
    }

    if (config.buttons) {
        Object.entries(config.buttons).forEach(([buttonName, buttonConfig]) => {
            if (!buttonConfig) {
                return;
            }

            const key = buttonName as CrudButtonName;
            crudButtonsConfig.buttons[key] = {
                ...(crudButtonsConfig.buttons[key] || {}),
                ...buttonConfig,
            };
        });
    }
}

export function resetCrudButtonsConfig() {
    Object.keys(crudButtonsConfig.defaults).forEach((key) => {
        delete crudButtonsConfig.defaults[key as keyof CrudButtonGlobalStyle];
    });
    Object.keys(crudButtonsConfig.buttons).forEach((key) => {
        delete crudButtonsConfig.buttons[key as CrudButtonName];
    });
}

export function getCrudButtonConfig(buttonName: CrudButtonName): CrudButtonStyle {
    return {
        ...crudButtonDefaultStyles[buttonName],
        ...crudButtonsConfig.defaults,
        ...(crudButtonsConfig.buttons[buttonName] || {}),
    };
}

export function useCrudButtonConfig(buttonName: CrudButtonName) {
    return computed(() => getCrudButtonConfig(buttonName));
}

export {crudButtonDefaultStyles, crudButtonsConfig};
