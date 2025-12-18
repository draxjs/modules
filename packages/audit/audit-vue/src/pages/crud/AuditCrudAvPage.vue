
<script setup lang="ts">
    import {reactive, defineProps, withDefaults, computed, ref, onMounted} from "vue";
    import type { IMetric, IAction, IEntity, IAudit } from "@drax/audit-share";
    import {AuditProvider} from "@drax/audit-front";
    import {formatDateTime} from "@drax/common-front";
    import BarChart from '../../components/charts/BarChart.vue'
    import ActivityChart from '../../components/charts/ActivityChart.vue'
    import SparklineChart from "../../components/charts/SparklineChart.vue";
    import PieChart from "../../components/charts/PieChart.vue"

    const props = withDefaults(defineProps<{
        customMetrics: IMetric[],
        customActions: IAction[],
        customEntities: IEntity[],
        useOnlyCustomMetrics: boolean,
        useOnlyCustomActions: boolean
    }>(), {
        customMetrics: () => [],
        customActions: () => [],
        customEntities: () => [],
        useOnlyCustomMetrics: false,
        useOnlyCustomActions: false
    })

    const pagination = reactive<{
        page: number,
        limit: number,
        total: number,
        totalPages: number,
        firstPageIsEnabled: boolean,
        previousPageIsEnabled: boolean,
        lastPageIsEnabled: boolean,
        nextPageIsEnabled: boolean,
    }>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        firstPageIsEnabled: false,
        previousPageIsEnabled: false,
        lastPageIsEnabled: false,
        nextPageIsEnabled: false,
    })

    const filters = reactive<{
        period: string,
        search: string,
        actions?: IAction[],
        entities?: IEntity[]
    }>({
        period: '24h',
        search: '',
        actions: undefined,
        entities: undefined
    })

    const periods = computed(() => [
        { value: '1h', label: 'Última hora' },
        { value: '24h', label: 'Últimas 24 horas' },
        { value: '7d', label: 'Últimos 7 días' },
        { value: '30d', label: 'Últimos 30 días' }
    ])

    const headers = computed(() => [
        { key: 'action' },
        { key: 'entity' },
        { key: 'user' },
        { key: 'changes' },
        { key: 'detail' },
        { key: 'createdAt' },
        { key: 'ip' }
    ])

    const commonMetrics = reactive<IMetric[]>([
        {
            title: 'Total Acciones',
            actionValue: 'total_actions',
            icon: 'mdi-trending-up',
            value: 950,
            percentage: 12.5,
            percentageBasis: 'previous_period',
            percentageColor: 'green'
        },
        {
            title: 'Creaciones',
            actionValue: 'created',
            icon: 'mdi-database-outline',
            value: 340,
            percentage: 35.8,
            percentageBasis: 'total_actions',
            percentageColor: 'grey'
        },
        {
            title: 'Actualizaciones',
            actionValue: 'updated',
            icon: 'mdi-progress-pencil',
            value: 485,
            percentage: 51.1,
            percentageBasis: 'total_actions',
            percentageColor: 'grey'
        },
        {
            title: 'Eliminaciones',
            actionValue: 'deleted',
            icon: 'mdi-delete-outline',
            value: 125,
            percentage: 13.1,
            percentageBasis: 'total_actions',
            percentageColor: 'grey'
        }
    ])

    const metrics = computed(() => {
        const items = []

        if(!props.useOnlyCustomMetrics) items.push(...commonMetrics)
        items.push(...props.customMetrics)

        return items
    })

    const commonActions: IAction[] = [
        {
            title: 'Crear',
            value: 'created',
            color: 'white',
            icon: 'mdi-plus'
        },
        {
            title: 'Actualizar',
            value: 'updated',
            color: 'black',
            icon: 'mdi-pencil'
        },
        {
            title: 'Eliminar',
            value: 'deleted',
            color: 'red',
            icon: 'mdi-trash'
        }
    ]

    const actionItems = computed(() => {
        const items = []

        if(!props.useOnlyCustomActions) items.push(...commonActions)
        items.push(...props.customActions)

        return items
    })

    const entityItems = computed(() => {
        return [
            ...props.customEntities
        ]
    })

    const view = ref<'list' | 'graph'>('list')

    const ListViewSelectorCard = ref()
    const GraphicViewSelectorCard = ref()

    const viewSelectorCardWidth = computed(() => {
        if(!ListViewSelectorCard.value || !GraphicViewSelectorCard.value) return 250
        return ListViewSelectorCard.value.$el.offsetWidth + GraphicViewSelectorCard.value.$el.offsetWidth + 65
    })

    const updateMetricsLoading = ref<boolean>(false)

    const updateMetrics = async () => {
        try {
            updateMetricsLoading.value = true;
            const metricPayload = metrics.value.map(metric => ({
                value: metric.actionValue,
                basis: metric.percentageBasis
            }))
    
            const resolve = await AuditProvider.instance.getMetrics({metrics: metricPayload, period: filters.period})
            
            // Update the metrics with the returned values
            resolve.metrics.forEach(result => {
                const metric = metrics.value.find(m => m.actionValue === result.metric);
                if (metric) {
                    metric.value = result.value
                    metric.percentage = result.percentage
                }
            })
        } catch(error) {
            console.error('[updateMetrics Error]: ', error)
        } finally {
            updateMetricsLoading.value = false;
        }
    }

    const items = ref<IAudit[]>([])

    const fetchLoading = ref<boolean>(false)

    const fetch = async () => {
        updateMetrics()
        fetchLoading.value = true
        setTimeout(async () => {
            try {
                getStatistics()

                const response = await AuditProvider.instance.paginate({limit: pagination.limit, page: pagination.page, filters: [
                    {field: 'createdAt', operator: 'gte', value: AuditProvider.instance.getPeriodDate(filters.period)},
                    {field: 'entity', operator: 'in', value: filters.entities?.map(value => value.value) || []},
                    {field: 'action', operator: 'in', value: filters.actions?.map(value => value.value) || []}
                ], order: "desc", orderBy: "createdAt", search: filters.search})
                items.value = response.items
    
                pagination.page = response.page
                pagination.limit = response.limit
                pagination.total = response.total
                pagination.totalPages = Math.ceil(response.total / pagination.limit)
                pagination.firstPageIsEnabled = response.page > 1
                pagination.previousPageIsEnabled = response.page > 1
                pagination.lastPageIsEnabled = response.page < pagination.totalPages
                pagination.nextPageIsEnabled = response.page < pagination.totalPages
            } catch(error) {
                console.error('[fetch Error]: ', error)
            } finally {
                fetchLoading.value = false;
            }
        })
    }

    onMounted(() => {
        fetch()
    })

    const getActionColor = (action: string) => {
        const item = actionItems.value.find(ai => ai.value === action);
        return item ? item.color : 'grey-lighten-1';
    }

    const getActionIcon = (action: string) => {
        const item = actionItems.value.find(ai => ai.value === action);
        return item ? item.icon : undefined;
    }

    const detailModal = reactive<{
        show: boolean,
        data: IAudit
    }>({ show: false, data: {} as IAudit })

    const showDetail = (item: IAudit) => {
        detailModal.data = item;
        detailModal.show = true;
    }

    const goToFirstPage = () => {
        pagination.page = 1
        fetch()
    }

    const goToPreviousPage = () => {
        if (pagination.page > 1) {
            pagination.page--
            fetch()
        }
    }
    
    const goToNextPage = () => {
        if (pagination.page < pagination.totalPages) {
            pagination.page++
            fetch()
        }
    }
    
    const goToLastPage = () => {
        pagination.page = pagination.totalPages
        fetch()
    }

    const statistics = reactive<{
        activity: {
            color: string,
            data: {
                user: string,
                actions: number
            }[]
        },
        actionsPerEntity: {
            actions: {
                name: string,
                color: string
            }[]
            data: {
                entity: string,
                actions: {
                    name: string,
                    value: number
                }[]
            }[]
        },
        percentagePerAction: {
            data: {
                action: string,
                percentage: number,
                color: string
            }[]
        },
        actionsPerPeriod: {
            data: number[]
        }
    }>({
        activity: {
            color: 'green',
            data: []
        },
        actionsPerEntity: {
            actions: actionItems.value.map(action => ({name: action.name, color: action.color})),
            data: []
        },
        percentagePerAction: {
            data: []
        },
        actionsPerPeriod: {
            data: []
        } 
    })

    const getStatisticsLoading = ref<boolean>(false)

    const getStatistics = async () => {
        try {
            getStatisticsLoading.value = true;

            const { activity, actionsPerEntity, percentagePerAction, actionsPerPeriod } = await AuditProvider.instance.getStatistics(filters.period)
    
            statistics.activity.data = activity
            statistics.actionsPerEntity.data = actionsPerEntity
            statistics.percentagePerAction.data = percentagePerAction.map(item => {
                item.color = getActionColor(item.action)
                return item
            })
            statistics.actionsPerPeriod.data = actionsPerPeriod
        } catch(error) {
            console.error('[getStatistics Error]: ', error)
        } finally {
            getStatisticsLoading.value = false;
        }
    }
</script>

<template>
    <v-card width="100%" class="d-flex px-16 align-center justify-space-between">
        <div>
            <h3>Auditoría del Sistema</h3>
            <span class="text-caption">Monitoreo de acciones y cambios</span>
        </div>
        <v-autocomplete
            class="mt-5"
            style="width: 250px; max-width: 200px;"
            variant="outlined"
            density="compact"
            :items="periods"
            item-title="label"
            item-value="value"
            v-model="filters.period"
            @update:model-value="fetch"
        ></v-autocomplete>
    </v-card>
    <v-card width="100%" class="px-16 pt-8 pb-4" variant="text">
        <v-row>
            <v-col class="px-2" cols="12" md="3" v-for="metric of metrics">
                <v-card class="pa-6" style="border-radius: 16px" height="150">
                    <template v-if="updateMetricsLoading">
                        <v-card variant="text" width="100%" height="100%" class="d-flex align-center justify-center">
                            <v-progress-circular  indeterminate height="2"></v-progress-circular>
                        </v-card>
                    </template>
                    <template v-else>
                        <div class="d-flex align-center justify-space-between">
                            <h4>{{ metric.title }}</h4>
                            <v-icon :icon="metric.icon" color="grey"></v-icon>
                        </div>
                        <v-spacer class="my-6"></v-spacer>
                        <div>
                            <h2>{{ metric.value }}</h2>
                            <span class="text-caption">
                                <span :class="`text-${metric.percentageColor}`" style="font-weight: bold;">
                                    {{ (metric.percentageBasis === 'previous_period' ? (metric.percentage === 0 ? '' : metric.percentage > 0 ? '+' : '-') : '') + parseFloat(metric.percentage.toFixed(2)) + '%' }}
                                </span>
                                <span>{{ metric.percentageBasis === 'previous_period' ? ' vs. periodo anterior' : ' del total de acciones' }}</span>
                            </span>
                        </div>
                    </template>
                </v-card>
            </v-col>
        </v-row>
        <v-spacer class="my-4"></v-spacer>
        <v-card class="d-flex justify-space-between pa-1" style="border-radius: 16px;" :style="{maxWidth: viewSelectorCardWidth + 'px'}">
            <v-card 
                ref="ListViewSelectorCard" class="pa-2" 
                @click="view = 'list'" :color="view === 'list' ? 'black': undefined"
                style="border-radius: 16px;" :variant="view === 'list' ? 'elevated' : 'text'"
            >
                <v-icon start>mdi-table-arrow-down</v-icon>
                Vista de Lista
            </v-card>
            <v-card 
                ref="GraphicViewSelectorCard" class="pa-2" 
                @click="view = 'graph'" :color="view === 'graph' ? 'black': undefined" 
                style="border-radius: 16px;" :variant="view === 'graph' ? 'elevated' : 'text'"
            >
                <v-icon start>mdi-chart-line</v-icon>
                Vista Gráfica
            </v-card>
        </v-card>
        <v-spacer class="my-4"></v-spacer>
        <v-card variant="text" style="border-radius: 16px;">
            <template v-if="view === 'list'">
                <v-card class="pt-4 px-4 d-flex flex-column">
                    <v-card variant="text" class="d-flex align-center justify-space-between">
                        <div>
                            <h3>Registro de Auditoría</h3>
                            <span class="text-caption">Historial de acciones en el sistema</span>
                        </div>
                        <v-card variant="text" class="d-flex align-center ga-4">
                            <v-text-field
                                width="300"
                                prepend-inner-icon="mdi-magnify"
                                placeholder="Buscar..."
                                persistent-placeholder
                                variant="outlined"
                                density="compact"
                                v-model="filters.search"
                                @keyup.enter="fetch"
                            ></v-text-field>
                            <v-autocomplete
                                min-width="150"
                                prepend-inner-icon="mdi-filter-outline"
                                placeholder="Todas"
                                variant="outlined"
                                multiple    
                                density="compact"
                                :items="actionItems"
                                return-object
                                v-model="filters.actions"
                                @update:model-value="fetch"
                            >
                                <template v-slot:selection="{index}">
                                    <span v-if="index === 0">
                                        {{ 
                                            filters.actions && filters.actions.length > 0 ? 
                                            (
                                                filters.actions.length > 1 ? 
                                                `${filters.actions.length} acciones seleccionadas` : 
                                                filters.actions[0].title
                                            ) : 
                                            'Todas' 
                                        }}
                                    </span>
                                    <span v-else></span>
                                </template>
                            </v-autocomplete>
                            <v-autocomplete
                                min-width="150"
                                placeholder="Todas"
                                variant="outlined"
                                multiple    
                                density="compact"
                                :items="entityItems"
                                return-object
                                @update:model-value="fetch"
                                v-model="filters.entities"
                            >
                            </v-autocomplete>
                        </v-card>
                    </v-card>
                    <v-divider></v-divider>
                    <v-progress-linear v-if="fetchLoading" height="2" indeterminate></v-progress-linear>
                    <v-card-text>
                        <v-row>
                            <v-col cols="2" class="pl-6">
                                <span>Acción</span>
                            </v-col>
                            <v-col cols="1">
                                <span>Entidad</span>
                            </v-col>
                            <v-col cols="1">
                                <span>Usuario</span>
                            </v-col>
                            <v-col cols="3">
                                <span>Cambios</span>
                            </v-col>
                            <v-col cols="3">
                                <span>Detalles</span>
                            </v-col>
                            <v-col cols="1">
                                <span>Fecha/Hora</span>
                            </v-col>
                            <v-col cols="1">
                                <span>IP</span>
                            </v-col>
                            <v-col cols="12">
                                <v-divider></v-divider>
                            </v-col>
                        </v-row>
                        <v-card variant="text" v-for="item of items" :key="item._id" height="75" @click="showDetail(item)" class="d-flex flex-column pl-2">
                            <v-row align="center">
                                <v-col cols="2">
                                    <div 
                                        class="d-flex align-center px-4 py-1" 
                                        :class="`bg-${getActionColor(item.action)}`" 
                                        style="width: fit-content; border-radius: 8px;"
                                    >
                                        <v-icon v-if="getActionIcon(item.action)" start :icon="getActionIcon(item.action)"></v-icon>
                                        {{ item.action.toLocaleUpperCase() }}
                                    </div>
                                </v-col>
                                <v-col cols="1">
                                    <span>{{ item.entity }}</span>
                                </v-col>
                                <v-col cols="1">
                                    <div class="d-flex flex-column">
                                        <span>{{ item.user.username }}</span>
                                        <span class="text-caption">{{ item.user.rolName }}</span>
                                    </div>
                                </v-col>
                                <v-col cols="3">
                                    <span>{{ 
                                        item.changes && item.changes.length > 0 ? (
                                            item.changes.length > 1 ? `${item.changes.length} campos modificados` : item.changes[0].field
                                        ) : 'Sin cambios' }}</span>
                                </v-col>
                                <v-col cols="3">
                                    <span>{{ item.detail || 'Sin detalles' }}</span>
                                </v-col>
                                <v-col cols="1">
                                    <span>{{ item.createdAt ? formatDateTime(item.createdAt.toString()) : '-' }}</span>
                                </v-col>
                                <v-col cols="1">
                                    <span>{{ item.ip || '-' }}</span>
                                </v-col>
                            </v-row>
                            <v-divider></v-divider>
                        </v-card>
                        <v-card-actions class="d-flex align-center pa-0 ma-0">
                            <span class="mr-4">
                                Mostrando {{ (pagination.page - 1) * pagination.limit + 1 }} a {{ Math.min(pagination.page * pagination.limit, pagination.total) }} de {{ pagination.total }} registros
                            </span>
                            <v-autocomplete
                                class="pt-4"
                                max-width="95"
                                variant="outlined"
                                density="compact"
                                :items="[5, 10, 20 ,50, 100]"
                                v-model="pagination.limit"
                                @update:model-value="fetch()"
                            ></v-autocomplete>
                            <v-spacer></v-spacer>
                            <v-card @click="() => pagination.firstPageIsEnabled ? goToFirstPage() : undefined" :disabled="!pagination.firstPageIsEnabled" width="30" height="30" :variant="pagination.firstPageIsEnabled ? 'outlined' : 'text'" density="compact" class="text-center pa-1">
                                <span class="text-caption">&lt;&lt;</span>
                            </v-card>
                            <v-card @click="() => pagination.previousPageIsEnabled ? goToPreviousPage() : undefined" :disabled="!pagination.previousPageIsEnabled" width="30" height="30" :variant="pagination.previousPageIsEnabled ? 'outlined' : 'text'" density="compact" class="text-center pa-1">
                                <span class="text-caption">&lt;</span>
                            </v-card>
                            <span>
                                <span>{{ pagination.page }}</span>
                                <span class="text-grey"> de {{ pagination.totalPages }}</span>
                            </span>
                            <v-card @click="() => pagination.nextPageIsEnabled ? goToNextPage() : undefined" :disabled="!pagination.nextPageIsEnabled" width="30" height="30" :variant="pagination.nextPageIsEnabled ? 'outlined' : 'text'" density="compact" class="text-center pa-1">
                                <span class="text-caption">&gt;</span>
                            </v-card>
                            <v-card @click="() => pagination.lastPageIsEnabled ? goToLastPage() : undefined" :disabled="!pagination.lastPageIsEnabled" width="30" height="30" :variant="pagination.lastPageIsEnabled ? 'outlined' : 'text'" density="compact" class="text-center pa-1">
                                <span class="text-caption">&gt;&gt;</span>
                            </v-card>
                        </v-card-actions>
                        <v-dialog v-model="detailModal.show" width="auto" persistent>
                            <v-card width="1000">
                                <v-toolbar class="pl-4">
                                    <div>
                                        <div class="d-flex ga-3 align-center">
                                            <h3>Detalle de auditoría</h3>
                                            <div 
                                                class="d-flex align-center px-4 py-1" 
                                                :class="`bg-${getActionColor(detailModal.data.action)}`" 
                                                style="width: fit-content; border-radius: 8px;"
                                            >
                                                <v-icon size="small" v-if="getActionIcon(detailModal.data.action)" start :icon="getActionIcon(detailModal.data.action)"></v-icon>
                                                <span class="text-caption">{{ detailModal.data.action.toLocaleUpperCase() }}</span>
                                            </div>
                                        </div>
                                        <span class="text-caption">Información completa del evento de auditoría</span>
                                    </div>
                                    <v-spacer></v-spacer>
                                    <v-btn icon="mdi-close" @click="detailModal.show = false"></v-btn>
                                </v-toolbar>
                                <v-card-text>
                                    <v-row class="pt-6">
                                        <v-col cols="12" md="6" class="py-0">
                                            <v-text-field
                                                variant="outlined"
                                                density="compact"
                                                label="ID"
                                                prepend-inner-icon="mdi-identifier"
                                                :model-value="detailModal.data._id"
                                                readonly
                                            ></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="6" class="py-0">
                                            <v-text-field
                                                variant="outlined"
                                                density="compact"
                                                label="created at"
                                                prepend-inner-icon="mdi-calendar-clock"
                                                :model-value="detailModal.data.createdAt ? formatDateTime(detailModal.data.createdAt.toString()) : 'N/A'"
                                                readonly
                                            ></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="6" class="py-0">
                                            <v-text-field
                                                variant="outlined"
                                                density="compact"
                                                label="Entity"
                                                prepend-inner-icon="mdi-database-outline"
                                                :model-value="detailModal.data.entity"
                                                readonly
                                            ></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="6" class="py-0">
                                            <v-text-field
                                                variant="outlined"
                                                density="compact"
                                                label="ResourceId"
                                                prepend-inner-icon="mdi-identifier"
                                                :model-value="detailModal.data.resourceId"
                                                readonly
                                            ></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="6" class="py-0">
                                            <v-text-field
                                                variant="outlined"
                                                density="compact"
                                                :label="`User (ID: ${detailModal.data.user?.id || 'N/A'})`"
                                                prepend-inner-icon="mdi-account"
                                                :model-value="detailModal.data.user?.username || '-'"
                                                readonly
                                            >
                                                <template v-slot:append-inner>
                                                    <v-chip size="x-small" color="grey">{{ detailModal.data.user.rolName }}</v-chip>
                                                </template>
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="6" class="py-0">
                                            <v-text-field
                                                variant="outlined"
                                                density="compact"
                                                label="SessionId"
                                                prepend-inner-icon="mdi-account-search-outline"
                                                :model-value="detailModal.data.sessionId"
                                                readonly
                                            ></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="6" class="py-0">
                                            <v-text-field
                                                variant="outlined"
                                                density="compact"
                                                label="Action"
                                                prepend-inner-icon="mdi-database-arrow-up"
                                                :model-value="detailModal.data.action"
                                                readonly
                                            ></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="6" class="py-0">
                                            <v-text-field
                                                variant="outlined"
                                                density="compact"
                                                label="IP"
                                                prepend-inner-icon="mdi-ip"
                                                :model-value="detailModal.data.ip"
                                                readonly
                                            ></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="6" class="py-0">
                                            <v-text-field
                                                variant="outlined"
                                                density="compact"
                                                label="User Agent"
                                                prepend-inner-icon="mdi-web"
                                                :model-value="detailModal.data.userAgent"
                                                readonly
                                            ></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="6" class="py-0">
                                            <v-text-field
                                                variant="outlined"
                                                density="compact"
                                                label="RequestId"
                                                prepend-inner-icon="mdi-pound-box-outline"
                                                :model-value="detailModal.data.requestId"
                                                readonly
                                            ></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="6" class="py-0">
                                            <v-text-field
                                                variant="outlined"
                                                density="compact"
                                                label="Detail"
                                                prepend-inner-icon="mdi-text-box-multiple-outline"
                                                :model-value="detailModal.data.detail"
                                                readonly
                                            ></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="6" class="py-0">
                                            <v-text-field
                                                v-if="detailModal.data.apiKey"
                                                variant="outlined"
                                                density="compact"
                                                :label="`ApiKey (ID: ${detailModal.data.apiKey?.id})`"
                                                prepend-inner-icon="mdi-key-variant"
                                                :model-value="detailModal.data.apiKey?.name"
                                                readonly
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <template v-if="detailModal.data.changes && detailModal.data.changes.length > 0">
                                        <v-divider class="my-4"></v-divider>
                                        <v-card variant="text">
                                            <h4 class="mb-4">Cambios Realizados</h4>
                                            <v-row>
                                                <v-col cols="12" v-for="change of detailModal.data.changes">
                                                    <v-card 
                                                        class="pa-4"
                                                        variant="outlined" style="border-radius: 8px; border: 1px solid rgba(66, 66, 66)">
                                                        <h3 class="mb-4">{{ change.field }}</h3>
                                                        <div class="d-flex ga-4">
                                                            <v-text-field
                                                                variant="outlined"
                                                                density="compact"
                                                                label="Antes"
                                                                :model-value="change.old"
                                                                readonly
                                                            ></v-text-field>
                                                            <v-text-field
                                                                variant="outlined"
                                                                density="compact"
                                                                label="Después"
                                                                :model-value="change.new"
                                                                readonly
                                                            ></v-text-field>
                                                        </div>
                                                    </v-card>
                                                </v-col>
                                            </v-row>
                                        </v-card>
                                    </template>
                                </v-card-text>
                            </v-card>
                        </v-dialog>
                    </v-card-text>
                </v-card>
            </template>
            <template v-if="view === 'graph'">
                <v-row>
                    <v-col cols="12" md="6" class="px-2">
                        <v-card class="pa-4" style="border-radius: 16px;">
                            <h4>Actividad por Hora</h4>
                            <span class="text-caption d-block">Distribución de acciones durante el día</span>
                            <sparkline-chart
                                :values="[0, 15, 255, 320, 1200, 3240]"
                            ></sparkline-chart>
                        </v-card>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-card class="pa-4" style="border-radius: 16px;">
                            <h4>Distribución por Tipo</h4>
                            <span class="text-caption d-block">Proporción de acciones</span>
                            <pie-chart
                                :loading="getStatisticsLoading" 
                                :data="statistics.percentagePerAction.data"
                            ></pie-chart>
                        </v-card>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-card class="pa-4" style="border-radius: 16px; height: 100%;">
                            <h4>Usuarios Más Activos</h4>
                            <span class="text-caption d-block">Top 5 usuarios por cantidad de acciones</span>
                            <activity-chart
                                :loading="getStatisticsLoading"
                                :color="statistics.activity.color"
                                :data="statistics.activity.data"
                            ></activity-chart>
                        </v-card>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-card class="pa-4" style="border-radius: 16px; height: 100%;">
                            <h4>Actividad por Entidad</h4>
                            <span class="text-caption d-block">Operaciones por tipo de entidad</span>
                            <bar-chart
                                :loading="getStatisticsLoading"
                                :actions="actionItems.map(item => ({name: item.value, color: item.color}))"
                                :data="statistics.actionsPerEntity.data"
                            ></bar-chart>
                        </v-card>
                    </v-col>
                </v-row>
            </template>
        </v-card>
    </v-card>
</template>

<style scoped>

</style>
