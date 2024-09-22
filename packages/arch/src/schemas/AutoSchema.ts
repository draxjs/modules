import {IEntitySchema} from "../interfaces/IEntitySchema";

const schema: IEntitySchema = {
  module: "seguro",
  name: "Auto",
  schema: {
    marca: { type: 'string', required: true, unique: true, index: true },
    modelos: { type: 'array.object', schema: {
        nombre: {type: 'string', required: false, unique: false, index: false},
        versiones: {type: 'array.string', required: false, unique: false, index: false}
      }
    }
  }
}


export default schema;
export { schema };
