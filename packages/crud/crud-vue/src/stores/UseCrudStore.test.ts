import {beforeEach, describe, expect, it} from "vitest";
import {createPinia, setActivePinia} from "pinia";
import {useCrudStore} from "./UseCrudStore";

describe('UseCrudStore input errors', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('removes errors for the deleted array item', () => {
        const store = useCrudStore('remove-deleted')

        store.setInputErrors({'items.1.name': ['required']})
        store.removeArrayItemInputErrors('items', 1)

        expect(store.inputErrors).toBeNull()
    })

    it('reindexes errors after the deleted array item', () => {
        const store = useCrudStore('remove-reindex')

        store.setInputErrors({'items.2.name': ['required']})
        store.removeArrayItemInputErrors('items', 1)

        expect(store.inputErrors).toEqual({'items.1.name': ['required']})
    })

    it('keeps previous errors and reindexes following errors when deleting', () => {
        const store = useCrudStore('remove-mixed')

        store.setInputErrors({
            'items.0.name': ['required'],
            'items.2.name': ['invalid']
        })

        store.removeArrayItemInputErrors('items', 1)

        expect(store.inputErrors).toEqual({
            'items.0.name': ['required'],
            'items.1.name': ['invalid']
        })
    })

    it('moves errors with the logical item when reordering', () => {
        const store = useCrudStore('reorder')

        store.setInputErrors({
            'items.0.name': ['first'],
            'items.2.name': ['third']
        })

        store.reorderArrayItemInputErrors('items', 2, 0)

        expect(store.inputErrors).toEqual({
            'items.1.name': ['first'],
            'items.0.name': ['third']
        })
    })

    it('matches list errors by exact field path segment', () => {
        const store = useCrudStore('list-errors')

        store.setInputErrors({'items.10.name': ['required']})

        expect(store.hasFieldListInputErrors('items.1')).toBe(false)
        expect(store.hasFieldListInputErrors('items.10')).toBe(true)
    })

    it('clears the exact array error when the array structure changes', () => {
        const store = useCrudStore('clear-array')

        store.setInputErrors({
            items: ['invalid'],
            name: ['required']
        })

        store.clearFieldInputErrors('items')


        expect(store.inputErrors).toEqual({name: ['required']})
    })
})
