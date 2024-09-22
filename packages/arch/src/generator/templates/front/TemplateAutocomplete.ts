import {IEntitySchema} from "../../../interfaces/IEntitySchema";

export const TemplateAutocomplete = (entity: IEntitySchema) => `
<v-autocomplete
  clearable
  chips
  label="Autocomplete"
  :items="['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']"
  multiple
></v-autocomplete>
`
