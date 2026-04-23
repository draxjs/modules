// Lista hardcodeada en i18n. Si se modifica acá, se tiene que cambiar en i18n
const defaultPasswordSpecialChars = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"

function resolveAllowedPasswordSpecialChars(allowedSpecialChars?: string | null): string {
    return allowedSpecialChars ?? defaultPasswordSpecialChars
}

export {defaultPasswordSpecialChars, resolveAllowedPasswordSpecialChars}
