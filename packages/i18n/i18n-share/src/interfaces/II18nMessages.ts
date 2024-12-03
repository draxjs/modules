interface I18nMessageCategory {
    [key: string]: string | I18nMessageCategory;
}

interface II18nMessages {
    [locale: string]: {
        [category: string]: I18nMessageCategory | string;
    };
}

export type {II18nMessages}
