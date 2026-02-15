import { IEntitySchema } from "../../../interfaces/IEntitySchema";

export const Templatei18nIndex = (entities: IEntitySchema[]) => {

    const imports = entities.map(entity => `import ${entity.name}Messages from "./${entity.name}-i18n"`).join("\n")
    const merges = entities.map(entity => `${entity.name}Messages`).join(",\n    ")

    return `
import merge from "deepmerge";
${imports}

const messages = merge.all([
    ${merges}
])

export default messages
`
}
