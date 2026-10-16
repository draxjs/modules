import assert from 'node:assert/strict';
import {test} from 'node:test';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
import type {IEntitySchema, ISchema} from '../src/interfaces/IEntitySchema';
import {TemplateEntityCrud} from '../src/generator/templates/front/TemplateEntityCrud';
import {TemplateMongoModel} from '../src/generator/templates/back/TemplateMongoModel';
import {TemplateMongoRepository} from '../src/generator/templates/back/TemplateMongoRepository';
import {TemplateSqliteRepository} from '../src/generator/templates/back/TemplateSqliteRepository';
import {TemplateSchema} from '../src/generator/templates/back/TemplateSchema';
import {TemplateEntityInterface} from '../src/generator/templates/share/TemplateEntityInterface';
import {TemplateCrudComponent} from '../src/generator/templates/front/TemplateCrudComponent';

const entity = (schema: ISchema): IEntitySchema => ({name: 'Example', module: 'test', schema});

// Execute generated code with local doubles, without depending on runtime Drax packages.
function loadTemplate(source: string, require: (name: string) => any): any {
    const result = ts.transpileModule(source, {
        compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020},
        reportDiagnostics: true,
    });
    assert.deepEqual(result.diagnostics, []);
    const exports = {};
    runInNewContext(result.outputText, {exports, require});
    return exports;
}

function loadCrud(schema: ISchema) {
    return loadTemplate(TemplateEntityCrud(entity(schema)), name => {
        if (name === '@drax/crud-vue') {
            return {EntityCrud: class {}, useCrudStore: () => ({})};
        }
        if (name === '@drax/identity-vue') {
            return {UserCrud: {instance: 'User'}, TenantCrud: {instance: 'Tenant'}, RoleCrud: {instance: 'Role'}};
        }
        return {default: {instance: name}};
    }).default.instance;
}

test('refvalue generates string defaults and configurable reference metadata', () => {
    const crud = loadCrud({
        category: {type: 'refvalue', ref: 'Category'},
        code: {type: 'refvalue', ref: 'Category', refDisplay: 'title', refValue: 'code', default: 'initial'},
        empty: {type: 'refvalue', ref: 'Category', default: ''},
    });
    const [category, code, empty] = crud.fields;
    assert.equal(category.type, 'refvalue');
    assert.equal(category.ref, 'Category');
    assert.equal(category.refDisplay, 'name');
    assert.equal(category.refValue, 'name');
    assert.equal(category.default, '');
    assert.equal(code.refDisplay, 'title');
    assert.equal(code.refValue, 'code');
    assert.equal(code.default, 'initial');
    assert.equal(empty.default, '');
    assert.equal(crud.refs.Category, './CategoryCrud');
    const source = TemplateEntityCrud(entity({
        first: {type: 'refvalue', ref: 'Category'},
        second: {type: 'refvalue', ref: 'Category'},
    }));
    assert.equal(source.match(/import CategoryCrud/g)?.length, 1);
    assert.equal(source.match(/Category: CategoryCrud.instance/g)?.length, 1);
});

test('array.refvalue generates array defaults and configurable reference metadata', () => {
    const defaults = ['initial', "O'Reilly", 'quoted "value"'];
    const schema: ISchema = {
        categories: {type: 'array.refvalue', ref: 'Category'},
        codes: {type: 'array.refvalue', ref: 'Category', refDisplay: 'title', refValue: 'code', default: defaults},
        empty: {type: 'array.refvalue', ref: 'Category', default: []},
        invalidDefault: {type: 'array.refvalue', ref: 'Category', default: 'not an array'},
        owner: {type: 'ref', ref: 'User'},
        owners: {type: 'array.ref', ref: 'User'},
    };
    const crud = loadCrud(schema);
    const [categories, codes, empty, invalidDefault, owner, owners] = crud.fields;
    assert.equal(categories.type, 'array.refvalue');
    assert.equal(categories.ref, 'Category');
    assert.equal(categories.refDisplay, 'name');
    assert.equal(categories.refValue, 'name');
    assert.equal(JSON.stringify(categories.default), '[]');
    assert.equal(codes.refDisplay, 'title');
    assert.equal(codes.refValue, 'code');
    assert.equal(JSON.stringify(codes.default), JSON.stringify(defaults));
    assert.equal(JSON.stringify(empty.default), '[]');
    assert.equal(JSON.stringify(invalidDefault.default), '[]');
    assert.equal(owner.default, null);
    assert.equal(JSON.stringify(owners.default), '[]');
    assert.equal('refValue' in owner, false);
    assert.equal('refValue' in owners, false);
    const source = TemplateEntityCrud(entity(schema));
    assert.equal(source.match(/import CategoryCrud/g)?.length, 1);
    assert.equal(source.match(/Category: CategoryCrud.instance/g)?.length, 1);
});

test('nested array.refvalue references collect imports recursively without duplicates', () => {
    const schema: ISchema = {
        details: {type: 'object', schema: {
            categories: {type: 'array.refvalue', ref: 'Category'},
            deeper: {type: 'object', schema: {
                tenants: {type: 'array.refvalue', ref: 'Tenant', default: ['main']},
            }},
        }},
        rows: {type: 'array.object', schema: {
            groups: {type: 'array.object', schema: {
                codes: {type: 'array.refvalue', ref: 'Category', refDisplay: 'title', refValue: 'code', default: ['a', 'b']},
                roles: {type: 'array.refvalue', ref: 'Role'},
            }},
        }},
    };
    const crud = loadCrud(schema);
    assert.deepEqual(Object.keys(crud.refs), ['Category', 'Tenant', 'Role']);
    assert.equal(crud.refs.Category, './CategoryCrud');
    assert.equal(crud.refs.Tenant, 'Tenant');
    assert.equal(crud.refs.Role, 'Role');
    const categories = crud.fields[0].objectFields[0];
    assert.equal(categories.refValue, 'name');
    assert.equal(categories.refDisplay, 'name');
    assert.equal(JSON.stringify(categories.default), '[]');
    const tenants = crud.fields[0].objectFields[1].objectFields[0];
    assert.equal(JSON.stringify(tenants.default), '["main"]');
    const [codes, roles] = crud.fields[1].objectFields[0].objectFields;
    assert.equal(codes.type, 'array.refvalue');
    assert.equal(codes.refValue, 'code');
    assert.equal(codes.refDisplay, 'title');
    assert.equal(JSON.stringify(codes.default), '["a","b"]');
    assert.equal(JSON.stringify(roles.default), '[]');
    const source = TemplateEntityCrud(entity(schema));
    assert.equal(source.match(/import CategoryCrud/g)?.length, 1);
    assert.equal(source.match(/Category: CategoryCrud.instance/g)?.length, 1);
    assert.match(source, /import \{TenantCrud\} from "@drax\/identity-vue"/);
    assert.match(source, /import \{RoleCrud\} from "@drax\/identity-vue"/);
});

test('nested object and array.object references share recursive imports and registry', () => {
    const schema: ISchema = {
        details: {type: 'object', schema: {
            category: {type: 'refvalue', ref: 'Category', refValue: 'code'},
            owner: {type: 'ref', ref: 'User'},
            deeper: {type: 'object', schema: {
                categories: {type: 'array.ref', ref: 'Category', refDisplay: 'title'},
            }},
        }},
        rows: {type: 'array.object', schema: {
            tenant: {type: 'refvalue', ref: 'Tenant'},
            role: {type: 'ref', ref: 'Role'},
        }},
    };
    const crud = loadCrud(schema);
    assert.deepEqual(Object.keys(crud.refs), ['Category', 'User', 'Tenant', 'Role']);
    assert.equal(crud.refs.User, 'User');
    assert.equal(crud.refs.Tenant, 'Tenant');
    assert.equal(crud.refs.Role, 'Role');
    const category = crud.fields[0].objectFields[0];
    assert.equal(category.refValue, 'code');
    assert.equal(category.refDisplay, 'name');
    assert.equal(category.default, '');
    const tenant = crud.fields[1].objectFields[0];
    assert.equal(tenant.refValue, 'name');
    assert.equal(tenant.default, '');
    const source = TemplateEntityCrud(entity(schema));
    assert.equal(source.match(/import CategoryCrud/g)?.length, 1);
    assert.match(source, /import \{TenantCrud\} from "@drax\/identity-vue"/);
    assert.equal(crud.fields[0].objectFields[1].type, 'ref');
    assert.equal(crud.fields[0].objectFields[2].objectFields[0].type, 'array.ref');
});

test('Mongo persists refvalue as String, recursively, without ref or populate', () => {
    const schema: ISchema = {
        value: {type: 'refvalue', ref: 'Category', required: true, index: true, unique: true},
        details: {type: 'object', schema: {nestedValue: {type: 'refvalue', ref: 'Category'}}},
        rows: {type: 'array.object', schema: {rowValue: {type: 'refvalue', ref: 'Category'}}},
    };
    const source = TemplateMongoModel(entity(schema));
    assert.match(source, /value: \{type: String,\s+required: true, index: true, unique: true/);
    assert.match(source, /nestedValue: \{type: String/);
    assert.match(source, /rowValue: \{type: String/);
    assert.doesNotMatch(source, /ref:|ObjectId/);
    assert.match(TemplateMongoRepository(entity(schema)), /this\._populateFields = \[\]/);
    const mixed = entity({...schema, relation: {type: 'ref', ref: 'Category'}, relations: {type: 'array.ref', ref: 'Category'}});
    assert.match(TemplateMongoModel(mixed), /type: mongoose.Schema.Types.ObjectId, ref: 'Category'/);
    assert.match(TemplateMongoRepository(mixed), /this\._populateFields = \['relation', 'relations'\]/);
});

test('SQLite uses TEXT without a relation and keeps nested values in JSON containers', () => {
    const schema: ISchema = {
        value: {type: 'refvalue', ref: 'Category', unique: true},
        details: {type: 'object', schema: {nestedValue: {type: 'refvalue', ref: 'Category'}}},
        rows: {type: 'array.object', schema: {rowValue: {type: 'refvalue', ref: 'Category'}}},
    };
    const repository = loadTemplate(TemplateSqliteRepository(entity(schema)), () => ({AbstractSqliteRepository: class {}})).default;
    const instance = new repository();
    assert.equal(instance.tableFields.find((field: any) => field.name === 'value').type, 'TEXT');
    assert.equal(instance.tableFields.find((field: any) => field.name === 'value').unique, true);
    assert.equal(instance.populateFields.length, 0);
    assert.equal(instance.jsonFields.join(','), 'details,rows');
    const mixed = TemplateSqliteRepository(entity({...schema, relation: {type: 'ref', ref: 'Category'}}));
    assert.match(mixed, /\{ field: 'relation', table: 'relation', identifier: '_id' \}/);
    assert.doesNotMatch(mixed, /\{ field: 'value'/);
});

test('Mongo persists array.refvalue as String arrays recursively without ref or populate', () => {
    const schema: ISchema = {
        values: {type: 'array.refvalue', ref: 'Category', required: true, index: true, unique: true},
        details: {type: 'object', schema: {nestedValues: {type: 'array.refvalue', ref: 'Category'}}},
        rows: {type: 'array.object', schema: {
            rowValues: {type: 'array.refvalue', ref: 'Category'},
            deeper: {type: 'object', schema: {deepValues: {type: 'array.refvalue', ref: 'Category'}}},
        }},
    };
    const source = TemplateMongoModel(entity(schema));
    assert.match(source, /values: \[\{type: String,\s+required: true, index: true, unique: true/);
    for (const field of ['nestedValues', 'rowValues', 'deepValues']) {
        assert.match(source, new RegExp(`${field}: \\[\\{type: String,\\s+required: false`));
    }
    assert.doesNotMatch(source, /ref:|ObjectId/);
    assert.match(TemplateMongoRepository(entity(schema)), /this\._populateFields = \[\]/);
    const mixed = entity({...schema, relation: {type: 'ref', ref: 'Category'}, relations: {type: 'array.ref', ref: 'Category'}});
    const model = TemplateMongoModel(mixed);
    assert.match(model, /relation: \{type: mongoose.Schema.Types.ObjectId, ref: 'Category'/);
    assert.match(model, /relations: \[\{type: mongoose.Schema.Types.ObjectId, ref: 'Category'/);
    assert.match(TemplateMongoRepository(mixed), /this\._populateFields = \['relation', 'relations'\]/);
});

test('SQLite persists array.refvalue as JSON arrays without relations', () => {
    const schema: ISchema = {
        values: {type: 'array.refvalue', ref: 'Category', unique: true},
        details: {type: 'object', schema: {nestedValues: {type: 'array.refvalue', ref: 'Category'}}},
        rows: {type: 'array.object', schema: {rowValues: {type: 'array.refvalue', ref: 'Category'}}},
    };
    const repository = loadTemplate(TemplateSqliteRepository(entity(schema)), () => ({AbstractSqliteRepository: class {}})).default;
    const instance = new repository();
    const field = instance.tableFields.find((field: any) => field.name === 'values');
    assert.equal(field.type, 'TEXT');
    assert.equal(field.unique, true);
    assert.equal(instance.populateFields.length, 0);
    assert.equal(instance.jsonFields.join(','), 'values,details,rows');
    const mixed = TemplateSqliteRepository(entity({...schema,
        relation: {type: 'ref', ref: 'Category'},
        relations: {type: 'array.ref', ref: 'Category'},
    }));
    assert.match(mixed, /\{ field: 'relation', table: 'relation', identifier: '_id' \}/);
    assert.match(mixed, /\{ field: 'relations', table: 'relations', identifier: '_id' \}/);
    assert.doesNotMatch(mixed, /\{ field: '(values|details|rows)'/);
});

test('array.refvalue uses string arrays in Zod schemas and both entity interfaces', () => {
    const schema: ISchema = {
        requiredValues: {type: 'array.refvalue', ref: 'Category', required: true},
        optionalValues: {type: 'array.refvalue', ref: 'Category'},
        defaultValues: {type: 'array.refvalue', ref: 'Category', default: ["O'Reilly", 'code']},
        emptyValues: {type: 'array.refvalue', ref: 'Category', default: []},
        details: {type: 'object', schema: {nestedValues: {type: 'array.refvalue', ref: 'Category'}}},
        rows: {type: 'array.object', schema: {rowValues: {type: 'array.refvalue', ref: 'Category', required: true, default: ['row']}}},
    };
    const source = TemplateSchema(entity(schema));
    assert.match(source, /requiredValues: z.array\(z.string\(\)\)(?=,)/);
    assert.match(source, /optionalValues: z.array\(z.string\(\)\).optional\(\)(?=,)/);
    assert.ok(source.includes(`defaultValues: z.array(z.string()).optional().default(["O'Reilly","code"])`));
    assert.match(source, /emptyValues: z.array\(z.string\(\)\).optional\(\).default\(\[\]\)/);
    assert.match(source, /nestedValues: z.array\(z.string\(\)\).optional\(\)/);
    assert.match(source, /rowValues: z.array\(z.string\(\)\).default\(\["row"\]\)/);
    assert.match(source, /const ExampleSchema = ExampleBaseSchema\s+\.extend\(\{\s+_id: z.coerce.string\(\),\s+\}\)/);
    assert.doesNotMatch(source, /CategorySchema|z.object\(\{_id|z.array\(z.coerce.string/);
    const interfaces = TemplateEntityInterface(entity(schema));
    for (const declaration of [
        'requiredValues: Array<string>', 'optionalValues?: Array<string>',
        'defaultValues?: Array<string>', 'emptyValues?: Array<string>',
        'nestedValues?: Array<string>', 'rowValues: Array<string>',
    ]) {
        assert.equal(interfaces.split(declaration).length - 1, 2);
    }
    assert.doesNotMatch(interfaces, /Array<any>|: any/);
    const mixed = TemplateSchema(entity({
        ...schema,
        relation: {type: 'ref', ref: 'Category', refDisplay: 'title'},
        relations: {type: 'array.ref', ref: 'Category', refDisplay: 'title'},
    }));
    assert.match(mixed, /relation: z.coerce.string\(\).optional\(\).nullable\(\)/);
    assert.match(mixed, /relations: z.array\(z.coerce.string\(\)\).optional\(\)/);
    assert.match(mixed, /relations: z.array\(z.object\(\{_id: z.coerce.string\(\), title: z.string\(\)\}\)\)/);
});

test('array.refvalue table slots render stored strings like array.string, not populated refs', () => {
    const source = TemplateCrudComponent(entity({
        values: {type: 'array.refvalue', ref: 'Category', refDisplay: 'title'},
        strings: {type: 'array.string'},
        relations: {type: 'array.ref', ref: 'Category', refDisplay: 'title'},
    }));
    for (const field of ['values', 'strings']) {
        assert.ok(source.includes(`<template v-slot:item.${field}="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>`));
    }
    assert.match(source, /value.map\(v => v.title\).join/);
});

test('Zod base and output schemas and both interfaces retain singular strings, including nested values', () => {
    const schema: ISchema = {
        requiredValue: {type: 'refvalue', ref: 'Category', required: true},
        optionalValue: {type: 'refvalue', ref: 'Category', default: 'initial'},
        details: {type: 'object', schema: {nestedValue: {type: 'refvalue', ref: 'Category'}}},
        rows: {type: 'array.object', schema: {rowValue: {type: 'refvalue', ref: 'Category', required: true}}},
    };
    const source = TemplateSchema(entity(schema));
    assert.match(source, /requiredValue: z.string\(\).min\(1,'validation.required'\)/);
    assert.match(source, /optionalValue: z.string\(\).optional\(\).default\('initial'\)/);
    assert.match(source, /nestedValue: z.string\(\).optional\(\)/);
    assert.match(source, /rowValue: z.string\(\).min\(1,'validation.required'\)/);
    // The output schema inherits refvalue unchanged; only relational refs are overridden.
    assert.match(source, /const ExampleSchema = ExampleBaseSchema\s+\.extend\(\{\s+_id: z.coerce.string\(\),\s+\}\)/);
    assert.doesNotMatch(source, /refDisplay|CategorySchema|z.object\(\{_id/);
    const interfaces = TemplateEntityInterface(entity(schema));
    for (const declaration of ['requiredValue: string', 'optionalValue?: string', 'nestedValue?: string', 'rowValue: string']) {
        assert.equal(interfaces.split(declaration).length - 1, 2);
    }
    assert.doesNotMatch(interfaces, /Array<string>|: any/);
});
