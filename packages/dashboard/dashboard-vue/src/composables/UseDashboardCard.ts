import {computed} from 'vue'
import {useDashboardStore} from "../stores/UseDashboardStore";
import type {IDashboardCard} from "@drax/dashboard-share";
import type {IDraxCrudProvider, IEntityCrud, IEntityCrudField} from "@drax/crud-share";
import {useI18n} from "vue-i18n";


export function useDashboardCard(card: IDashboardCard) {


    const store = useDashboardStore()
    const {t, te} = useI18n()

    const cardEntity = computed<IEntityCrud>(() => {
        return store.getEntities.find((entity: IEntityCrud) => entity.name === card.entity)
    })

    const cardEntityFields = computed<IEntityCrudField[]>(() => {
        return cardEntity.value?.fields
    })

    const cardEntityProvider = computed<IDraxCrudProvider<any,any,any>>(() => {
        return cardEntity.value?.provider || null
    })

    const groupByHeaders = computed(() => {
        const headers =  card?.groupBy?.fields.map((field: string) => {
            return {
                title: te(`${card.entity.toLowerCase()}.field.${field}`)
                    ? t(`${card.entity.toLowerCase()}.field.${field}`)
                    : field,
                key: field,
                align: 'start' as const
            }
        }) || []
        return [
           ...headers,
            {title: t('crud.groupBy.count'), key: 'count', align: 'end' as const }
        ]
    })


    const paginateHeaders = computed(() => {
        return  card?.paginate?.columns.map((field: string) => {
            return {
                title: te(`${card.entity.toLowerCase()}.field.${field}`)
                    ? t(`${card.entity.toLowerCase()}.field.${field}`)
                    : field,
                key: field,
                align: 'start' as const
            }
        }) || []
    })

    const fetchGroupByData = async function () {
        if(cardEntityProvider && cardEntityProvider?.value?.groupBy){
            const filters = card.filters
            const fields = card.groupBy?.fields
            const dateFormat = card.groupBy?.dateFormat
            const data = await cardEntityProvider.value.groupBy({filters, fields, dateFormat})
            return data
        }
    }

    const fetchPaginateData = async function () {
        if(cardEntityProvider?.value?.paginate){
            const filters = card.filters
            const page = 1
            const limit = 10
            const data = await cardEntityProvider.value.paginate({page, limit, filters})
            return data
        }
    }



    return {
        fetchGroupByData,
        fetchPaginateData,
        groupByHeaders,
        paginateHeaders,
        cardEntity,
        cardEntityFields,
        cardEntityProvider
    }
}
