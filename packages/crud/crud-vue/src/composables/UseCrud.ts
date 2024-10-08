import type {IDraxPaginateResult, IEntityCrud} from "@drax/crud-share";
import {useCrudStore} from "../stores/UseCrudStore";
import {computed} from "vue";

export function useCrud(entity: IEntityCrud) {

  const store = useCrudStore()

  const dialog = computed({get(){return store.dialog} , set(value){store.setDialog(value)}})
  const operation = computed({get(){return store.operation} , set(value){store.setOperation(value)}})
  const form = computed({get(){return store.form} , set(value){store.setForm(value)}})
  const formValid = computed({get(){return store.formValid} , set(value){store.setFormValid(value)}})
  const notify = computed({get(){return store.notify} , set(value){store.setNotify(value)}})
  const error = computed({get(){return store.error} , set(value){store.setError(value)}})
  const message = computed({get(){return store.message} , set(value){store.setMessage(value)}})
  const loading = computed({get(){return store.loading} , set(value){store.setLoading(value)}})
  const itemsPerPage = computed({get(){return store.itemsPerPage} , set(value){store.setItemsPerPage(value)}})
  const page = computed({get(){return store.page} , set(value){store.setPage(value)}})
  const sortBy = computed({get(){return store.sortBy} , set(value){store.setSortBy(value)}})
  const search = computed({get(){return store.search} , set(value){store.setSearch(value)}})
  const totalItems = computed({get(){return store.totalItems} , set(value){store.setTotalItems(value)}})
  const items = computed({get(){return store.items} , set(value){store.setItems(value)}})
  const exportFiles = computed({get(){return store.exportFiles} , set(value){store.setExportFiles(value)}})
  const exportLoading = computed({get(){return store.exportLoading} , set(value){store.setExportLoading(value)}})
  const exportListVisible = computed({get(){return store.exportListVisible} , set(value){store.setExportListVisible(value)}})
  const filters = computed({get(){return store.filters} , set(value){store.setFilters(value)}})


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

      if(!entity?.provider.export) {
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

      if(r && r.url) {
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




  function onCreate() {
    store.setOperation("create")
    store.setForm(entity.form)
    store.setDialog(true)
  }

  function cast(item: any){
    entity.fields.filter(field => field.type === 'date')
        .forEach(field => {
            item[field.name] = new Date(item[field.name])
        })

    entity.fields.filter(field => field.type === 'ref')
        .forEach(field => {
          item[field.name] = item[field.name]._id
        })

    entity.fields.filter(field => field.type === 'array.ref')
        .forEach(field => {
          item[field.name] = item[field.name].map(((i:any) => i._id))
        })

    return item
  }

  function onEdit(item: object) {
    store.setOperation("edit")
    store.setForm(cast({...item}))
    store.setDialog(true)
  }

  function onDelete(item: object) {
    store.setOperation("delete")
    store.setForm(cast({...item}))
    store.setDialog(true)
  }

  function onCancel() {
    store.setDialog(false)
    store.setError("")
    store.setInputErrors(null)
  }

  function onSubmit(formData: any) {
    store.setInputErrors(null)
    switch (store.operation) {
      case "create":
        doCreate(formData)
        break
      case "edit":
        doUpdate(formData)
        break
      case "delete":
        doDelete(formData)
        break
    }
  }

  async function doCreate(formData: any) {
    try {
      await entity?.provider.create(formData)
      await doPaginate()
      store.setDialog(false)
      store.showMessage("Entity created successfully!")
    } catch (e: any) {
      if(e.inputErrors){
        store.setInputErrors(e.inputErrors)
      }
      store.setError(e.message || "An error occurred while creating the entity")
      console.error("Error creating entity", e)
    }

  }

  async function doUpdate(formData: any) {
    try {
      await entity?.provider.update(formData._id, formData)
      await doPaginate()
      store.setDialog(false)
      store.showMessage("Entity updated successfully!")
    } catch (e: any) {
      console.log("inputErrors", e.inputErrors)
      if(e.inputErrors){
        store.setInputErrors(e.inputErrors)
      }
      store.setError(e.message || "An error occurred while updating the entity")
      console.error("Error updating entity", e)
    }

  }

  async function doDelete(formData: any) {
    try {
      await entity?.provider.delete(formData._id)
      await doPaginate()
      store.setDialog(false)
      store.showMessage("Entity deleted successfully!")
    } catch (e: any) {
      store.setError(e.message || "An error occurred while deleting the entity")
      console.error("Error updating entity", e)
    }

  }

  function resetCrudStore(){
    store.$reset()
  }

  function prepareFilters(){
    store.setFilters(entity.formFilters)
  }


  return {
    doPaginate, doExport, onCreate, onEdit, onDelete, onCancel, onSubmit,resetCrudStore,
    operation, dialog, form, notify, error, message, formValid,
    loading, itemsPerPage, page, sortBy, search, totalItems, items,
    prepareFilters,filters,
    exportFiles,exportLoading,exportListVisible
  }

}
