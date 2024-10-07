import {defineStore} from "pinia";
import type {TOperation} from "../interfaces/TOperation";

export const useCrudStore = defineStore('CrudStore', {
    state: () => (
        {
            operation: null as TOperation,
            dialog: false as boolean,
            form: {} as any,
            formValid: {} as any,
            notify: false as boolean,
            message: '' as string,
            error: '' as string,
            items: [] as any[],
            totalItems: 0 as number,
            itemsPerPage: 5 as number,
            page: 1 as number,
            search: '' as string,
            sortBy: [] as any[],
            loading: false,
            inputErrors: null,
            exportLoading: false,
            exportFiles: [] as string[],
            exportListVisible: false,
        }
    ),
    getters:{
      getInputErrors(state: any) {
          return (fieldName:string) => {
              if (state.inputErrors && state.inputErrors[fieldName]) {
                  return state.inputErrors[fieldName]
              }
              return []
          }
      }
    },
    actions: {
        setOperation(operation: TOperation) {
            this.operation = operation
        },
        setDialog(dialog: boolean) {
            this.dialog = dialog
        },
        setForm(form: any) {
            this.form = form
        },
        setFormValid(formValid: any) {
            this.formValid = formValid
        },
        setError(error: string) {
            this.error = error
        },
        showMessage(message: string) {
            this.message = message
            this.notify = true
        },
        setNotify(notify: boolean) {
            this.notify = notify
        },
        setMessage(message: string) {
            this.message = message
        },
        setItems(items: any[]) {
            this.items = items
        },
        setTotalItems(totalItems: number) {
            this.totalItems = totalItems
        },
        setItemsPerPage(itemsPerPage: number) {
            this.itemsPerPage = itemsPerPage
        },
        setPage(page: number) {
            this.page = page
        },
        setSearch(search: string) {
            this.search = search
        },
        setSortBy(sortBy: any[]) {
            this.sortBy = sortBy
        },
        setLoading(loading: boolean) {
            this.loading = loading
        },
        setInputErrors(inputErrors: any) {
            this.inputErrors = inputErrors
        },
        resetErrors(){
            this.inputErrors = null
            this.error = ''
        },
        setExportFiles(exportFiles: string[]) {
            this.exportFiles = exportFiles
        },
        addExportFile(exportFile: string) {
            this.exportFiles.push(exportFile)
        },
        setExportLoading(exportLoading: boolean) {
            this.exportLoading = exportLoading
        },
        setExportListVisible(exportListVisible: boolean) {
            this.exportListVisible = exportListVisible
        }
    }

})
