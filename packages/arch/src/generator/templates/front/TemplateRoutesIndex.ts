import { IEntitySchema } from "../../../interfaces/IEntitySchema";

export const TemplateRoutesIndex = (entities: IEntitySchema[]) => {

    const imports = entities.map(entity => `import ${entity.name}CrudRoute from "./${entity.name}CrudRoute"`).join("\n")
    const exports = entities.map(entity => `...${entity.name}CrudRoute`).join(",\n")

    return `
${imports}

export const routes = [
    ${exports}
]

export default routes
`
}
