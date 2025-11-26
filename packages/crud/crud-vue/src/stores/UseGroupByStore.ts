
import { defineStore } from 'pinia'
import type {IDraxGroupByDateFormat, IEntityCrudField} from "@drax/crud-share";

export const useGroupByStore = defineStore('useGroupByStore', {
  state: () => ({
    dialog: false as boolean,
    selectedFields: [] as IEntityCrudField[],
    dateFormat: 'day' as IDraxGroupByDateFormat,
    loading: false as boolean,
    groupByData: [] as any[],
    groupByError: '' as string
  }),

  getters: {
    hasSelectedFields(state): boolean {
      return state.selectedFields.length > 0
    },

    selectedFieldsCount(state): number {
      return state.selectedFields.length
    },

    isFieldSelected(state) {
      return (field: IEntityCrudField): boolean => {
        return state.selectedFields.some(sf => sf.name === field.name)
      }
    },

    hasGroupByData(state): boolean {
      return state.groupByData.length > 0
    },

    groupByDataCount(state): number {
      return state.groupByData.length
    },

    getGroupByDataByField(state) {
      return (fieldName: string, fieldValue: any): any | undefined => {
        return state.groupByData.find((result: any) => result[fieldName] === fieldValue)
      }
    }
  },

  actions: {
    openDialog() {
      this.dialog = true
    },

    closeDialog() {
      this.dialog = false
    },

    resetFields() {
      this.selectedFields = []
    },

    resetAndClose() {
      this.resetFields()
      this.closeDialog()
    },

    setLoading(value: boolean) {
      this.loading = value
    },

    setSelectedFields(fields: IEntityCrudField[]) {
      this.selectedFields = fields
    },

    addField(field: IEntityCrudField) {
      if (!this.selectedFields.some(f => f.name === field.name)) {
        this.selectedFields.push(field)
      }
    },

    removeField(field: IEntityCrudField) {
      const index = this.selectedFields.findIndex((f) => f.name === field.name)
      if (index > -1) {
        this.selectedFields.splice(index, 1)
      }
    },

    setGroupByData(data: any[]) {
      this.groupByData = data
    },

    clearGroupByData() {
      this.groupByData = []
    },

    setGroupByError(error: string) {
      this.groupByError = error
    },

    clearGroupByError() {
      this.groupByError = ''
    },

    setDateFormat(dateFormat: IDraxGroupByDateFormat) {
      this.dateFormat = dateFormat
    }

  }
})
