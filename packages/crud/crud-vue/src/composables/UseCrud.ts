import type {IDraxPaginateResult, IEntityCrud} from "@drax/crud-share";
import {useCrudStore} from "../stores/UseCrudStore";
import {computed, toRaw} from "vue";
import getItemId from "../helpers/getItemId";

export function useCrud(entity: IEntityCrud) {

    const store = useCrudStore()


    const dialog = computed({
        get() {
            return store.dialog
        }, set(value) {
            store.setDialog(value)
        }
    })
    const operation = computed({
        get() {
            return store.operation
        }, set(value) {
            store.setOperation(value)
        }
    })
    const form = computed({
        get() {
            return store.form
        }, set(value) {
            store.setForm(value)
        }
    })
    const formValid = computed({
        get() {
            return store.formValid
        }, set(value) {
            store.setFormValid(value)
        }
    })
    const notify = computed({
        get() {
            return store.notify
        }, set(value) {
            store.setNotify(value)
        }
    })
    const error = computed({
        get() {
            return store.error
        }, set(value) {
            store.setError(value)
        }
    })
    const message = computed({
        get() {
            return store.message
        }, set(value) {
            store.setMessage(value)
        }
    })
    const loading = computed({
        get() {
            return store.loading
        }, set(value) {
            store.setLoading(value)
        }
    })
    const itemsPerPage = computed({
        get() {
            return store.itemsPerPage
        }, set(value) {
            store.setItemsPerPage(value)
        }
    })
    const page = computed({
        get() {
            return store.page
        }, set(value) {
            store.setPage(value)
        }
    })
    const sortBy = computed({
        get() {
            return store.sortBy
        }, set(value) {
            store.setSortBy(value)
        }
    })
    const search = computed({
        get() {
            return store.search
        }, set(value) {
            store.setSearch(value)
        }
    })
    const totalItems = computed({
        get() {
            return store.totalItems
        }, set(value) {
            store.setTotalItems(value)
        }
    })
    const items = computed({
        get() {
            return store.items
        }, set(value) {
            store.setItems(value)
        }
    })
    const exportFiles = computed({
        get() {
            return store.exportFiles
        }, set(value) {
            store.setExportFiles(value)
        }
    })
    const exportLoading = computed({
        get() {
            return store.exportLoading
        }, set(value) {
            store.setExportLoading(value)
        }
    })
    const exportListVisible = computed({
        get() {
            return store.exportListVisible
        }, set(value) {
            store.setExportListVisible(value)
        }
    })
    const filters = computed({
        get() {
            return store.filters
        }, set(value) {
            store.setFilters(value)
        }
    })


    async function doPaginate() {
        store.setLoading(true)
        try {

            const r: IDraxPaginateResult<any> = await entity?.provider.paginate({
                page: store.page,
                limit: store.itemsPerPage,
                orderBy: store.sortBy[0]?.key,
                order: store.sortBy[0]?.order,
                search: store.search,
                filters: store.filters
            })
            store.setItems(r.items)
            store.setTotalItems(r.total)
        } catch (e) {
            console.error("Error paginating", e)
        } finally {
            store.setLoading(false)
        }
    }

    async function doExport(format: 'JSON') {
        store.setExportLoading(true)
        store.setExportListVisible(true)
        try {

            if (!entity?.provider.export) {
                throw new Error("provider.export not implemented")
            }

            const headers: string = entity.exportHeaders.join(',')

            const r: any = await entity?.provider.export({
                format: format,
                headers: headers,
                separator: ";",
                orderBy: store.sortBy[0]?.key,
                order: store.sortBy[0]?.order,
                search: store.search
            })

            if (r && r.url) {
                store.addExportFile(r)
                store.showMessage("Export successful")
            }

            return r

        } catch (e) {
            console.error("Error exporting csv", e)
        } finally {
            store.setExportLoading(false)
        }
    }


    function cast(item: any) {
        entity.fields.filter(field => field.type === 'date')
            .forEach(field => {
                item[field.name] = new Date(item[field.name])
            })

        entity.fields.filter(field => field.type === 'ref')
            .forEach(field => {
                item[field.name] = getItemId(item[field.name]) ? getItemId(item[field.name]) : item[field.name]

            })

        entity.fields.filter(field => field.type === 'array.ref')
            .forEach(field => {
                if (item[field.name] && Array.isArray(item[field.name])) {
                    item[field.name] = item[field.name].map(((i: any) => getItemId(i) ? getItemId(i) : i))
                }else{
                    item[field.name] = []
                }
            })

        return item
    }

    function onView(item: object) {
        store.setOperation("view")
        store.setForm(cast({...item}))
        openDialog()
    }


    function onCreate() {
        store.setForm(entity.form)
        store.setOperation("create")
        openDialog()
    }

    function onEdit(item: object) {
        store.setForm(cast(cloneItem(item)))
        store.setOperation("edit")
        openDialog()
    }

    function cloneItem(item: object):object {
        try{
            return JSON.parse(JSON.stringify(item))
        }catch (error){
            console.error("Error cloning item", error)
            return ({})
        }
    }

    function onDelete(item: object) {
        store.setForm(cast({...item}))
        store.setOperation("delete")
        openDialog()
    }

    function onCancel() {
        closeDialog()
        store.setError("")
        store.setInputErrors(null)
    }

    async function onSubmit(formData: any): Promise<{status:string,item?:any}> {
        store.setInputErrors(null)
        switch (store.operation) {
            case "view":
                closeDialog()
                return {status: 'viewed'}
            case "create":
                return doCreate(formData)
            case "edit":
                return doUpdate(formData)
            case "delete":
                return doDelete(formData)
        }
        return {status: 'unknown'}
    }

    function openDialog() {
        store.setDialog(true)
    }

    function closeDialog() {
        store.setDialog(false)
    }

    async function doCreate(formData: any) {
        try {
            store.setLoading(true)
            let item = await entity?.provider.create(toRaw(formData))
            await doPaginate()
            closeDialog()
            store.showMessage("Entity created successfully!")
            return {status: 'created', item: item}
        } catch (e: any) {
            if (e.inputErrors) {
                store.setInputErrors(e.inputErrors)
            }
            store.setError(e.message || "An error occurred while creating the entity")
            console.error("Error creating entity", e)
            return {status: 'error'}
        } finally {
            store.setLoading(false)
        }

    }

    async function doUpdate(formData: any) {
        try {
            store.setLoading(true)
            let item = await entity?.provider.update(getItemId(formData), toRaw(formData))
            await doPaginate()
            closeDialog()
            store.showMessage("Entity updated successfully!")
            return {status: 'updated', item: item}
        } catch (e: any) {
            //console.log("inputErrors", e.inputErrors)
            if (e.inputErrors) {
                store.setInputErrors(e.inputErrors)
            }
            store.setError(e.message || "An error occurred while updating the entity")
            console.error("Error updating entity", e)
            return {status: 'error'}
        } finally {
            store.setLoading(false)
        }

    }

    async function doDelete(formData: any) {
        try {
            store.setLoading(true)
            await entity?.provider.delete(getItemId(formData))
            await doPaginate()
            closeDialog()
            store.showMessage("Entity deleted successfully!")
            return {status: 'deleted'}
        } catch (e: any) {
            store.setError(e.message || "An error occurred while deleting the entity")
            console.error("Error updating entity", e)
            return {status: 'error'}
        } finally {
            store.setLoading(false)
        }

    }

    function resetCrudStore() {
        store.$reset()
    }

    function prepareFilters() {
        store.setFilters(entity.formFilters)
    }


    return {
        doPaginate, doExport, onView, onCreate, onEdit, onDelete, onCancel, onSubmit, resetCrudStore,
        operation, dialog, form, notify, error, message, formValid,
        loading, itemsPerPage, page, sortBy, search, totalItems, items,
        prepareFilters, filters,
        exportFiles, exportLoading, exportListVisible
    }

}
