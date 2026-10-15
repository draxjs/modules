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
