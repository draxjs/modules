import type {IEntityCrudField} from "@drax/crud-share";

function normalizeNumberValue(value: any) {
  if (value === '') {
    return null;
  }

  if (value === null || value === undefined || typeof value === 'number') {
    return value;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : value;
}

function normalizeFieldValue(field: Pick<IEntityCrudField, 'type'> | undefined, value: any) {
  if (!field) {
    return value;
  }

  if (field.type === 'number') {
    return normalizeNumberValue(value);
  }

  if (field.type === 'array.number' && Array.isArray(value)) {
    return value.map(normalizeNumberValue);
  }

  return value;
}

export {normalizeFieldValue};
