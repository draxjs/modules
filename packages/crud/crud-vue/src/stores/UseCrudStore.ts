import {defineStore} from "pinia";
import type {IEntityCrudOperation} from "@drax/crud-share";

export const useCrudStore = defineStore('CrudStore', {
    state: () => (
        {
            operation: null as IEntityCrudOperation,
            dialog: false as boolean,
            form: {} as any,
            formValid: {} as any,
            notify: false as boolean,
            message: '' as string,
            error: '' as string,
            filters: [] as any[],
            items: [] as any[],
            totalItems: 0 as number,
            itemsPerPage: 10 as number,
            page: 1 as number,
            search: '' as string,
            sortBy: [] as any[],
            loading: false,
            inputErrors: null,
            exportLoading: false,
            exportFiles: [] as string[],
            exportListVisible: false,
            exportError: false
        }
    ),
    getters: {
        getFieldInputErrors(state: any) {
            return (fieldName: string) => {
                if (state.inputErrors && state.inputErrors[fieldName]) {
                    return state.inputErrors[fieldName]
                }
                return []
            }
        },
        hasFieldListInputErrors(state: any) {
            return (fieldListName: string) => {
                if(state.inputErrors && typeof state.inputErrors === 'object'){
                    for(const key in state.inputErrors) {
                        return key.startsWith(fieldListName)
                    }
                }
            }
        },
        getFilterIndex(state: any) {
            return (filterName: string) => {
                return state.filters.findIndex((filter: any) => filter.field === filterName)
            }
        }

    },
    actions: {
        setOperation(operation: IEntityCrudOperation) {
            this.operation = operation
        },
        setDialog(dialog: boolean) {
            this.dialog = dialog
        },
        setForm(form: any) {
            this.form = form
        },
        setFormFieldValue(name: string, value: any) {
            this.form[name] = value
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
        resetErrors() {
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
        },
        setExportError(error: boolean){
            this.exportError = error
        },
        setFilters(filters: any[]) {
            this.filters = filters
        },
        setFilterValue(name:string, value:any) {
            const index = this.getFilterIndex(name)
            if (index >= 0) {
                this.filters[index].value = value
            }
        }
    }

})
