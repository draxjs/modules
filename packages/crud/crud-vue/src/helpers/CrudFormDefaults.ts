import type {IEntityCrudField} from '@drax/crud-share';

function cloneDefault(value: any): any {
  if (value instanceof Date) {
    return new Date(value.getTime());
  }
  if (Array.isArray(value)) {
    return value.map(cloneDefault);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneDefault(entry)]));
  }
  return value;
}

function createFieldDefault(field: IEntityCrudField): any {
  if (field.default !== undefined) {
    return cloneDefault(field.default);
  }
  if (field.type.startsWith('array.')) {
    return [];
  }
  switch (field.type) {
    case 'string':
    case 'longString':
    case 'password':
      return '';
    case 'boolean':
      return false;
    case 'object':
      return createFormDefaults(field.objectFields ?? []);
    case 'record':
      return {};
    default:
      return null;
  }
}

// Only absent values receive defaults; null represents an explicitly empty value.
function initializeFormDefaults(fields: IEntityCrudField[], item: any): any {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return item;
  }
  fields.forEach(field => {
    if (item[field.name] === undefined) {
      item[field.name] = createFieldDefault(field);
    }
    if (field.type === 'object') {
      initializeFormDefaults(field.objectFields ?? [], item[field.name]);
    } else if (field.type === 'array.object' && Array.isArray(item[field.name])) {
      item[field.name].forEach((entry: any) => initializeFormDefaults(field.objectFields ?? [], entry));
    }
  });
  return item;
}

function createFormDefaults(fields: IEntityCrudField[]): Record<string, any> {
  return initializeFormDefaults(fields, {});
}

export {createFieldDefault, createFormDefaults, initializeFormDefaults};
