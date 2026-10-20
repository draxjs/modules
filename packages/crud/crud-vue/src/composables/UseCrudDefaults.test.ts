import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {createPinia, setActivePinia} from 'pinia'
import {effectScope, type EffectScope} from 'vue'
import type {IEntityCrudField} from '@drax/crud-share'
import {EntityCrud} from '../cruds/EntityCrud'
import {useCrudStore} from '../stores/UseCrudStore'
import {useCrud} from './UseCrud'

vi.mock('vue-router', () => ({
  useRouter: () => ({push: vi.fn()}),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({t: (key: string) => key, te: () => false}),
}))

function field(type: IEntityCrudField['type'], options: Partial<IEntityCrudField> = {}): IEntityCrudField {
  return {name: 'value', label: 'Value', type, default: undefined, ...options}
}

function createFields(): IEntityCrudField[] {
  const details = [
    field('string', {name: 'title', default: 'Untitled'}),
    field('boolean', {name: 'enabled', default: false}),
    field('number', {name: 'count', default: 0}),
    field('object', {
      name: 'preferences',
      objectFields: [
        field('string', {name: 'theme', default: 'light'}),
        field('array.string', {name: 'tags', default: ['blue']}),
      ],
    }),
  ]
  return [
    field('id', {name: '_id'}),
    field('string', {name: 'name', default: 'New'}),
    field('string', {name: 'nullable', default: null}),
    field('boolean', {name: 'enabled', default: false}),
    field('number', {name: 'count', default: 0}),
    field('string', {name: 'empty', default: ''}),
    field('object', {name: 'details', objectFields: details}),
    field('array.object', {name: 'rows', objectFields: details}),
    field('array.object', {
      name: 'defaultRows', default: [{title: 'Seed'}], objectFields: details,
    }),
    field('object', {
      name: 'partial', default: {preferences: {theme: 'dark'}}, objectFields: details,
    }),
    field('record', {name: 'metadata', default: {labels: ['initial']}}),
    field('array.number', {name: 'scores'}),
  ]
}

class DefaultsEntity extends EntityCrud {
  constructor(name = 'Defaults', private readonly definitions = createFields()) {
    super()
    this.name = name
  }

  get fields(): IEntityCrudField[] {
    return this.definitions
  }
}

function expectedDetails(title = 'Untitled', theme = 'light') {
  return {title, enabled: false, count: 0, preferences: {theme, tags: ['blue']}}
}

function expectedNewForm() {
  return {
    _id: null,
    name: 'New',
    nullable: null,
    enabled: false,
    count: 0,
    empty: '',
    details: expectedDetails(),
    rows: [],
    defaultRows: [expectedDetails('Seed')],
    partial: expectedDetails('Untitled', 'dark'),
    metadata: {labels: ['initial']},
    scores: [],
  }
}

const scopes: EffectScope[] = []

function setupCrud(entity = new DefaultsEntity()) {
  const scope = effectScope()
  scopes.push(scope)
  return scope.run(() => useCrud(entity))!
}

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  scopes.splice(0).forEach(scope => scope.stop())
})

const itemOperations = [
  ['onEdit', 'edit', true],
  ['prepareEdit', 'edit', false],
  ['onView', 'view', true],
  ['onDelete', 'delete', true],
] as const

describe('useCrud form defaults integration', () => {
  it.each(itemOperations)('%s completes nested legacy records and arrays without mutating the source', (method, operation, opensDialog) => {
    const crud = setupCrud()
    const item = {
      _id: 'legacy-id',
      name: 'Existing',
      details: {preferences: {theme: 'legacy'}, extra: 'keep'},
      rows: [{title: 'First', preferences: {tags: []}}, {}, {preferences: null}],
      extra: {tags: ['legacy']},
    }
    const snapshot = JSON.parse(JSON.stringify(item))

    crud[method](item)

    expect(crud.operation.value).toBe(operation)
    expect(crud.dialog.value).toBe(opensDialog)
    expect(crud.form.value).toEqual({
      ...expectedNewForm(),
      _id: 'legacy-id',
      name: 'Existing',
      details: {...expectedDetails('Untitled', 'legacy'), extra: 'keep'},
      rows: [
        {...expectedDetails('First'), preferences: {theme: 'light', tags: []}},
        expectedDetails(),
        {...expectedDetails(), preferences: null},
      ],
      extra: {tags: ['legacy']},
    })
    expect(crud.form.value).not.toBe(item)
    expect(crud.form.value.details).not.toBe(item.details)
    expect(crud.form.value.rows).not.toBe(item.rows)
    expect(crud.form.value.rows[0]).not.toBe(item.rows[0])
    expect(item).toEqual(snapshot)

    crud.form.value.details.preferences.tags.push('changed')
    crud.form.value.rows[0].preferences.tags.push('changed')
    crud.form.value.extra.tags.push('changed')

    expect(crud.form.value.rows[1].preferences.tags).toEqual(['blue'])
    expect(item).toEqual(snapshot)
  })

  it.each(itemOperations)('%s preserves explicit null, false, zero, empty strings and extra values', (method) => {
    const crud = setupCrud()
    const item = {
      name: '', nullable: null, enabled: false, count: 0, empty: '',
      details: null, rows: null, defaultRows: [], partial: null,
      metadata: {custom: false}, scores: [], extra: 0,
    }

    crud[method](item)

    expect(crud.form.value).toEqual({_id: null, ...item})
    expect(item).not.toHaveProperty('_id')
  })

  it.each(itemOperations)('%s initializes missing top-level objects and arrays with explicit falsy defaults', (method) => {
    const crud = setupCrud()
    const item = {name: undefined, enabled: undefined, count: undefined}

    crud[method](item)

    expect(crud.form.value).toEqual(expectedNewForm())
    expect(item).toEqual({name: undefined, enabled: undefined, count: undefined})
    expect(Object.keys(item)).toEqual(['name', 'enabled', 'count'])
  })

  it('onCreate uses EntityCrud.form, opens the dialog and clears previous errors', () => {
    const entity = new DefaultsEntity()
    const crud = setupCrud(entity)
    const store = useCrudStore(entity.name)
    store.setError('previous error')
    store.setInputErrors({name: ['required']})
    crud.onEdit({_id: 'old', name: 'Old', extra: 'legacy'})

    crud.onCreate()

    expect(crud.operation.value).toBe('create')
    expect(crud.dialog.value).toBe(true)
    expect(crud.form.value).toEqual(expectedNewForm())
    expect(store.form).toBe(crud.form.value)
    expect(store.error).toBe('')
    expect(store.inputErrors).toBeNull()
  })

  it('onCreate starts with independent mutable defaults on every invocation', () => {
    const entity = new DefaultsEntity()
    const crud = setupCrud(entity)
    crud.onCreate()
    const first = crud.form.value
    first.details.preferences.tags.push('changed')
    first.defaultRows[0].preferences.tags.push('changed')
    first.partial.preferences.theme = 'changed'
    first.metadata.labels.push('changed')
    first.rows.push({title: 'Added'})
    first.scores.push(10)

    crud.onCreate()

    expect(crud.form.value).not.toBe(first)
    expect(crud.form.value).toEqual(expectedNewForm())
    expect(entity.form).toEqual(expectedNewForm())
    expect(first.rows).toEqual([{title: 'Added'}])
  })

  it('keeps defaults independent between new entity instances and their useCrud stores', () => {
    const definitions = createFields()
    const firstEntity = new DefaultsEntity('FirstDefaults', definitions)
    const secondEntity = new DefaultsEntity('SecondDefaults', definitions)
    const firstCrud = setupCrud(firstEntity)
    const secondCrud = setupCrud(secondEntity)
    firstCrud.onCreate()
    secondCrud.onCreate()

    firstCrud.form.value.defaultRows[0].preferences.tags.push('changed')
    firstCrud.form.value.metadata.labels.push('changed')
    firstCrud.form.value.details.count = 42

    expect(secondCrud.form.value).toEqual(expectedNewForm())
    expect(firstEntity.form).toEqual(expectedNewForm())
    expect(secondEntity.form).toEqual(expectedNewForm())
    expect(definitions.find(entry => entry.name === 'metadata')?.default).toEqual({labels: ['initial']})
    expect(definitions.find(entry => entry.name === 'defaultRows')?.default).toEqual([{title: 'Seed'}])
  })
})

describe('EntityCrud.form defaults integration', () => {
  it('returns a new deep form per access and per instance, even with shared field definitions', () => {
    const definitions = createFields()
    const entity = new DefaultsEntity('First', definitions)
    const otherEntity = new DefaultsEntity('Second', definitions)
    const first = entity.form
    const second = entity.form
    const other = otherEntity.form

    expect(first).toEqual(expectedNewForm())
    expect(first).not.toBe(second)
    expect(first.details).not.toBe(second.details)
    expect(first.defaultRows[0]).not.toBe(second.defaultRows[0])
    expect(first.metadata).not.toBe(other.metadata)

    first.details.preferences.tags.push('changed')
    first.defaultRows[0].preferences.tags.push('changed')
    first.partial.preferences.theme = 'changed'
    first.metadata.labels.push('changed')
    first.rows.push({title: 'Added'})
    first.scores.push(10)

    expect(second).toEqual(expectedNewForm())
    expect(other).toEqual(expectedNewForm())
    expect(entity.form).toEqual(expectedNewForm())
    expect(definitions.find(entry => entry.name === 'partial')?.default).toEqual({preferences: {theme: 'dark'}})
  })
})
