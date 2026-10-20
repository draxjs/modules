import {describe, expect, it} from 'vitest'
import type {IEntityCrudField} from '@drax/crud-share'
import {createFieldDefault, createFormDefaults, initializeFormDefaults} from './CrudFormDefaults'

function field(type: IEntityCrudField['type'], options: Partial<IEntityCrudField> = {}): IEntityCrudField {
  return {name: 'value', label: 'Value', type, default: undefined, ...options}
}

const typeDefaults: [IEntityCrudField['type'], unknown][] = [
  ['string', ''],
  ['longString', ''],
  ['password', ''],
  ['id', null],
  ['number', null],
  ['date', null],
  ['ref', null],
  ['refvalue', null],
  ['enum', null],
  ['select', null],
  ['file', null],
  ['fullFile', null],
  ['boolean', false],
  ['array.string', []],
  ['array.number', []],
  ['array.object', []],
  ['array.record', []],
  ['array.ref', []],
  ['array.refvalue', []],
  ['array.enum', []],
  ['array.fullFile', []],
  ['record', {}],
  ['object', {}],
]

function nestedFields(): IEntityCrudField[] {
  return [
    field('string', {name: 'name', default: 'New'}),
    field('object', {
      name: 'settings',
      objectFields: [
        field('boolean', {name: 'enabled'}),
        field('object', {
          name: 'appearance',
          objectFields: [
            field('string', {name: 'theme', default: 'light'}),
            field('array.string', {name: 'colors', default: ['blue']}),
          ],
        }),
      ],
    }),
  ]
}

describe('createFieldDefault', () => {
  it.each(typeDefaults)('uses the implicit default for %s', (type, expected) => {
    expect(createFieldDefault(field(type))).toEqual(expected)
  })

  it.each(typeDefaults)('gives explicit falsy defaults priority for %s', (type) => {
    for (const value of [null, false, 0, '']) {
      expect(createFieldDefault(field(type, {default: value}))).toBe(value)
    }
  })

  it('uses explicit defaults instead of inferring them from the field type', () => {
    expect(createFieldDefault(field('string', {default: 'Configured'}))).toBe('Configured')
    expect(createFieldDefault(field('number', {default: 42}))).toBe(42)
    expect(createFieldDefault(field('boolean', {default: true}))).toBe(true)
    expect(createFieldDefault(field('array.string', {default: ['one']}))).toEqual(['one'])
    expect(createFieldDefault(field('record', {default: {key: 'value'}}))).toEqual({key: 'value'})
  })

  it('creates object fields recursively using each nested default', () => {
    expect(createFieldDefault(field('object', {objectFields: nestedFields()}))).toEqual({
      name: 'New',
      settings: {enabled: false, appearance: {theme: 'light', colors: ['blue']}},
    })
  })

  it('keeps an explicit object default ahead of inferred object fields', () => {
    const definition = field('object', {
      default: {name: 'Configured'},
      objectFields: nestedFields(),
    })

    expect(createFieldDefault(definition)).toEqual({name: 'Configured'})
  })

  it('leaves array.object empty even when its object fields have defaults', () => {
    expect(createFieldDefault(field('array.object', {objectFields: nestedFields()}))).toEqual([])
  })

  it('deeply clones dates, arrays and objects without changing the definition', () => {
    const date = new Date('2026-01-02T03:04:05.000Z')
    const value = {date, rows: [{tags: ['original'], metadata: {date}}]}
    const definition = field('object', {default: value})
    const first = createFieldDefault(definition)
    const second = createFieldDefault(definition)

    expect(first).toEqual(value)
    expect(first).not.toBe(value)
    expect(first.date).toBeInstanceOf(Date)
    expect(first.date).not.toBe(date)
    expect(first.rows).not.toBe(value.rows)
    expect(first.rows[0]).not.toBe(value.rows[0])
    expect(first.rows[0].tags).not.toBe(value.rows[0].tags)
    expect(first.rows[0].metadata).not.toBe(value.rows[0].metadata)
    expect(first.rows[0].metadata.date).not.toBe(date)

    first.date.setUTCFullYear(2000)
    first.rows[0].tags.push('changed')
    first.rows[0].metadata.date.setUTCFullYear(2001)

    expect(second).toEqual(value)
    expect(date.toISOString()).toBe('2026-01-02T03:04:05.000Z')
    expect(value.rows[0].tags).toEqual(['original'])
  })

  it('clones a top-level Date and array default on every call', () => {
    const date = new Date('2026-01-02T00:00:00.000Z')
    const dateField = field('date', {default: date})
    const arrayField = field('array.object', {default: [{dates: [date]}]})
    const copiedDate = createFieldDefault(dateField)
    const copiedArray = createFieldDefault(arrayField)

    expect(copiedDate).toEqual(date)
    expect(copiedDate).not.toBe(date)
    expect(copiedDate).not.toBe(createFieldDefault(dateField))
    expect(copiedArray).toEqual(arrayField.default)
    expect(copiedArray).not.toBe(arrayField.default)
    expect(copiedArray[0].dates[0]).toBeInstanceOf(Date)
    expect(copiedArray[0].dates[0]).not.toBe(date)
    copiedArray[0].dates.push(new Date())
    expect(createFieldDefault(arrayField)).toEqual([{dates: [date]}])
  })
})

describe('createFormDefaults', () => {
  it('returns an empty form for no fields', () => {
    expect(createFormDefaults([])).toEqual({})
  })

  it('creates named entries for every declared field type', () => {
    const fields = typeDefaults.map(([type], index) => field(type, {name: `field${index}`}))
    const expected = Object.fromEntries(typeDefaults.map(([, value], index) => [`field${index}`, value]))

    expect(createFormDefaults(fields)).toEqual(expected)
  })

  it('creates independent forms, including nested implicit containers and explicit defaults', () => {
    const fields = [
      ...nestedFields(),
      field('record', {name: 'metadata'}),
      field('array.object', {name: 'rows', default: [{tags: ['initial']}]}),
      field('array.number', {name: 'scores'}),
    ]
    const first = createFormDefaults(fields)
    const second = createFormDefaults(fields)

    first.settings.appearance.colors.push('red')
    first.settings.enabled = true
    first.metadata.extra = true
    first.rows[0].tags.push('changed')
    first.scores.push(1)

    expect(second).toEqual({
      name: 'New',
      settings: {enabled: false, appearance: {theme: 'light', colors: ['blue']}},
      metadata: {},
      rows: [{tags: ['initial']}],
      scores: [],
    })
    expect(createFormDefaults(fields)).toEqual(second)
    expect(fields.find(entry => entry.name === 'rows')?.default).toEqual([{tags: ['initial']}])
  })
})

describe('initializeFormDefaults', () => {
  it('mutates and returns the original item, including for an empty schema', () => {
    const item = {extra: 'keep'}

    expect(initializeFormDefaults([], item)).toBe(item)
    expect(item).toEqual({extra: 'keep'})
  })

  it.each(typeDefaults)('initializes missing and explicitly undefined %s fields', (type, expected) => {
    const fields = [field(type, {name: 'missing'}), field(type, {name: 'unset'})]
    const item = {unset: undefined, extra: 'keep'}

    expect(initializeFormDefaults(fields, item)).toBe(item)
    expect(item).toEqual({missing: expected, unset: expected, extra: 'keep'})
  })

  it.each(typeDefaults)('preserves null and existing falsy values for %s', (type) => {
    for (const value of [null, false, 0, '']) {
      const item = {value, extra: 'keep'}

      initializeFormDefaults([field(type, {default: 'replacement'})], item)

      expect(item).toEqual({value, extra: 'keep'})
    }
  })

  it('fills missing fields in legacy records without replacing existing objects or arrays', () => {
    const fields = [
      ...nestedFields(),
      field('array.object', {name: 'rows', objectFields: nestedFields()}),
    ]
    const appearance = {theme: 'dark', extra: 'keep'}
    const settings = {enabled: null, appearance}
    const row = {name: 'Existing row', settings: {appearance: {colors: []}}, extra: 42}
    const rows = [row]
    const item = {name: 'Existing', settings, rows, extra: 'legacy'}

    expect(initializeFormDefaults(fields, item)).toBe(item)
    expect(item.settings).toBe(settings)
    expect(item.settings.appearance).toBe(appearance)
    expect(item.rows).toBe(rows)
    expect(item.rows[0]).toBe(row)
    expect(item).toEqual({
      name: 'Existing',
      settings: {enabled: null, appearance: {theme: 'dark', colors: ['blue'], extra: 'keep'}},
      rows: [{
        name: 'Existing row',
        settings: {enabled: false, appearance: {theme: 'light', colors: []}},
        extra: 42,
      }],
      extra: 'legacy',
    })
  })

  it('completes partial object defaults recursively, including default array.object entries', () => {
    const fields = [
      field('object', {
        name: 'profile',
        default: {settings: {appearance: {theme: 'dark'}}, extra: 'default'},
        objectFields: nestedFields(),
      }),
      field('array.object', {
        name: 'rows',
        default: [{name: 'Default row'}, {settings: {enabled: true}}],
        objectFields: nestedFields(),
      }),
    ]
    const item: Record<string, any> = {}

    initializeFormDefaults(fields, item)

    expect(item).toEqual({
      profile: {
        name: 'New',
        settings: {enabled: false, appearance: {theme: 'dark', colors: ['blue']}},
        extra: 'default',
      },
      rows: [
        {name: 'Default row', settings: {enabled: false, appearance: {theme: 'light', colors: ['blue']}}},
        {name: 'New', settings: {enabled: true, appearance: {theme: 'light', colors: ['blue']}}},
      ],
    })
    expect(fields[0].default).toEqual({settings: {appearance: {theme: 'dark'}}, extra: 'default'})
    expect(fields[1].default).toEqual([{name: 'Default row'}, {settings: {enabled: true}}])
  })

  it('recurses through array.object fields nested inside array.object entries', () => {
    const fields = [field('array.object', {
      name: 'groups',
      objectFields: [field('array.object', {name: 'members', objectFields: nestedFields()})],
    })]
    const item = {groups: [{members: [{name: 'Ana'}, {}]}, {}]}

    initializeFormDefaults(fields, item)

    expect(item).toEqual({groups: [
      {members: [
        {name: 'Ana', settings: {enabled: false, appearance: {theme: 'light', colors: ['blue']}}},
        {name: 'New', settings: {enabled: false, appearance: {theme: 'light', colors: ['blue']}}},
      ]},
      {members: []},
    ]})
  })

  it('preserves existing values instead of merging parent defaults into legacy objects', () => {
    const fields = [field('object', {
      name: 'profile',
      default: {name: 'Parent default', extra: 'default'},
      objectFields: nestedFields(),
    })]
    const item = {profile: {name: 'Existing', settings: null, extra: 'legacy'}}

    initializeFormDefaults(fields, item)

    expect(item).toEqual({profile: {name: 'Existing', settings: null, extra: 'legacy'}})
  })

  it('keeps populated record and non-object array fields unchanged', () => {
    const metadata = {legacy: {missing: undefined}, empty: null}
    const tags = ['legacy']
    const records = [{legacy: true}]
    const date = new Date('2026-01-02T00:00:00.000Z')
    const item = {metadata, tags, records, date}
    const fields = [
      field('record', {name: 'metadata', default: {replacement: true}}),
      field('array.string', {name: 'tags', default: ['replacement']}),
      field('array.record', {name: 'records', default: [{replacement: true}]}),
      field('date', {name: 'date', default: new Date('2000-01-01T00:00:00.000Z')}),
    ]

    initializeFormDefaults(fields, item)

    expect(item.metadata).toBe(metadata)
    expect(item.metadata).toEqual({legacy: {missing: undefined}, empty: null})
    expect(item.tags).toBe(tags)
    expect(item.tags).toEqual(['legacy'])
    expect(item.records).toBe(records)
    expect(item.records).toEqual([{legacy: true}])
    expect(item.date).toBe(date)
  })

  it('does not share mutable defaults between items, array entries or schema definitions', () => {
    const fields = [
      field('date', {name: 'date', default: new Date('2026-01-02T00:00:00.000Z')}),
      field('array.object', {name: 'rows', objectFields: nestedFields()}),
      field('record', {name: 'metadata', default: {tags: []}}),
    ]
    const first: Record<string, any> = {rows: [{}, {}]}
    const second: Record<string, any> = {rows: [{}]}
    initializeFormDefaults(fields, first)
    initializeFormDefaults(fields, second)

    first.date.setUTCFullYear(2000)
    first.metadata.tags.push('changed')
    first.rows[0].settings.appearance.colors.push('red')

    expect(first.rows[1].settings.appearance.colors).toEqual(['blue'])
    expect(second.rows[0].settings.appearance.colors).toEqual(['blue'])
    expect(second.metadata).toEqual({tags: []})
    expect(second.date.toISOString()).toBe('2026-01-02T00:00:00.000Z')
    expect(fields[0].default.toISOString()).toBe('2026-01-02T00:00:00.000Z')
    expect(fields[2].default).toEqual({tags: []})
  })

  it('is idempotent and preserves initialized references on repeated calls', () => {
    const fields = nestedFields()
    const item: Record<string, any> = {}
    initializeFormDefaults(fields, item)
    const settings = item.settings
    const colors = item.settings.appearance.colors

    expect(initializeFormDefaults(fields, item)).toBe(item)
    expect(item.settings).toBe(settings)
    expect(item.settings.appearance.colors).toBe(colors)
    expect(item).toEqual({
      name: 'New',
      settings: {enabled: false, appearance: {theme: 'light', colors: ['blue']}},
    })
  })
})
