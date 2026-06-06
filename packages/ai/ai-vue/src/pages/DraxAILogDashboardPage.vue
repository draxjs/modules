<script setup lang="ts">
import {computed, ref, watch} from "vue";
import type {IDraxFieldFilter, IDraxGroupByDateFormat} from "@drax/crud-share";
import {VDateInput} from "vuetify/labs/VDateInput";
import {useTheme} from "vuetify";
import {AILogProvider} from "@drax/ai-front";

type DateGroupFormat = Extract<IDraxGroupByDateFormat, "hour" | "day" | "month" | "year">
type AILogMetricField = "inputTokens" | "outputTokens" | "tokens"
type AILogDimensionField = "provider" | "model"
type AILogField = "startedAt" | AILogDimensionField | AILogMetricField
type Accent = "total" | "provider" | "model" | "input" | "output" | "tokens"

type AILogGroupByRow = {
  startedAt?: unknown
  provider?: unknown
  model?: unknown
  inputTokens?: number
  outputTokens?: number
  tokens?: number
  count?: number
}

type SummaryRow = {
  startedAt: string
  provider?: string
  model?: string
  count: number
  metric?: number
  percentage: number
}

type CardConfig = {
  key: string
  title: string
  icon: string
  accent: Accent
  fields: AILogField[]
  rows: SummaryRow[]
  metricField?: AILogMetricField
  metricLabel?: string
}

const theme = useTheme();
const today = new Date(new Date().setHours(0, 0, 0, 0));
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

const fromDate = ref<Date | null>(monthStart);
const toDate = ref<Date | null>(today);
const dateGroupFormat = ref<DateGroupFormat>("day");
const totalRows = ref<SummaryRow[]>([]);
const providerRows = ref<SummaryRow[]>([]);
const modelRows = ref<SummaryRow[]>([]);
const inputTokenRows = ref<SummaryRow[]>([]);
const outputTokenRows = ref<SummaryRow[]>([]);
const tokenRows = ref<SummaryRow[]>([]);
const loading = ref(false);
const error = ref("");
let requestId = 0;

const isDarkTheme = computed(() => theme.current.value.dark);

const numberFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const percentageFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const dateGroupOptions = [
  {title: "Hora", value: "hour"},
  {title: "Día", value: "day"},
  {title: "Mes", value: "month"},
  {title: "Año", value: "year"},
];

const dateGroupLabel = computed(() => {
  if (dateGroupFormat.value === "year") return "año";
  if (dateGroupFormat.value === "month") return "mes";
  if (dateGroupFormat.value === "hour") return "hora";
  return "día";
});

const dateGroupHeader = computed(() => {
  if (dateGroupFormat.value === "year") return "Año";
  if (dateGroupFormat.value === "month") return "Mes";
  if (dateGroupFormat.value === "hour") return "Hora";
  return "Día";
});

const cards = computed<CardConfig[]>(() => [
  {
    key: "total",
    title: `Logs por ${dateGroupLabel.value}`,
    icon: "mdi-chart-timeline-variant",
    accent: "total",
    fields: ["startedAt"],
    rows: totalRows.value,
  },
  {
    key: "provider",
    title: `Logs por ${dateGroupLabel.value} y provider`,
    icon: "mdi-cloud-outline",
    accent: "provider",
    fields: ["startedAt", "provider"],
    rows: providerRows.value,
  },
  {
    key: "model",
    title: `Logs por ${dateGroupLabel.value}, provider y model`,
    icon: "mdi-brain",
    accent: "model",
    fields: ["startedAt", "provider", "model"],
    rows: modelRows.value,
  },
  {
    key: "inputTokens",
    title: `Input tokens por ${dateGroupLabel.value}, provider y model`,
    icon: "mdi-arrow-collapse-right",
    accent: "input",
    fields: ["startedAt", "provider", "model", "inputTokens"],
    rows: inputTokenRows.value,
    metricField: "inputTokens",
    metricLabel: "Input tokens",
  },
  {
    key: "outputTokens",
    title: `Output tokens por ${dateGroupLabel.value}, provider y model`,
    icon: "mdi-arrow-expand-right",
    accent: "output",
    fields: ["startedAt", "provider", "model", "outputTokens"],
    rows: outputTokenRows.value,
    metricField: "outputTokens",
    metricLabel: "Output tokens",
  },
  {
    key: "tokens",
    title: `Tokens por ${dateGroupLabel.value}, provider y model`,
    icon: "mdi-counter",
    accent: "tokens",
    fields: ["startedAt", "provider", "model", "tokens"],
    rows: tokenRows.value,
    metricField: "tokens",
    metricLabel: "Tokens",
  },
]);

function getStartOfDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getEndOfDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function buildFilters(): IDraxFieldFilter[] {
  const filters: IDraxFieldFilter[] = [];

  if (fromDate.value) {
    filters.push({field: "startedAt", operator: "gte", value: getStartOfDay(fromDate.value)});
  }

  if (toDate.value) {
    filters.push({field: "startedAt", operator: "lte", value: getEndOfDay(toDate.value)});
  }

  return filters;
}

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

function formatPercentage(value: number): string {
  return `${percentageFormatter.format(value)}%`;
}

function formatDateGroup(value: unknown): string {
  if (!value) return "Sin fecha";

  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return String(value);

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");

  if (dateGroupFormat.value === "year") return String(year);
  if (dateGroupFormat.value === "month") return `${month}/${year}`;
  if (dateGroupFormat.value === "hour") return `${day}/${month}/${year} ${hour}:00`;

  return `${day}/${month}/${year}`;
}

function getDisplayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Sin asignar";

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const displayValue = record.name ?? record.title ?? record.username ?? record.email ?? record._id;
    return displayValue ? String(displayValue) : "Sin asignar";
  }

  return String(value);
}

function getStartedAtTime(row: AILogGroupByRow): number {
  if (!row.startedAt) return Number.POSITIVE_INFINITY;

  const date = new Date(row.startedAt as string | number | Date);
  const time = date.getTime();

  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
}

function sortByStartedAtAsc(rows: AILogGroupByRow[]): AILogGroupByRow[] {
  return [...rows].sort((firstRow, secondRow) => getStartedAtTime(firstRow) - getStartedAtTime(secondRow));
}

function toSummaryRows(rows: AILogGroupByRow[], metricField?: AILogMetricField): SummaryRow[] {
  const totalCount = rows.reduce((sum, row) => sum + Number(row.count ?? 0), 0);

  return sortByStartedAtAsc(rows).map(row => {
    const count = Number(row.count ?? 0);

    return {
      startedAt: formatDateGroup(row.startedAt),
      provider: getDisplayValue(row.provider),
      model: getDisplayValue(row.model),
      count,
      metric: metricField ? Number(row[metricField] ?? 0) : undefined,
      percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
    };
  });
}

function getTotalCount(rows: SummaryRow[]): number {
  return rows.reduce((sum, row) => sum + row.count, 0);
}

function getTotalMetric(rows: SummaryRow[]): number {
  return rows.reduce((sum, row) => sum + Number(row.metric ?? 0), 0);
}

function getRowKey(row: SummaryRow, card: CardConfig): string {
  return [
    card.key,
    row.startedAt,
    row.provider,
    row.model,
    row.metric,
    row.count,
  ].join("-");
}

function hasField(card: CardConfig, field: AILogDimensionField): boolean {
  return card.fields.includes(field);
}

function getColumnCount(card: CardConfig): number {
  return 3
    + (hasField(card, "provider") ? 1 : 0)
    + (hasField(card, "model") ? 1 : 0)
    + (card.metricLabel ? 1 : 0);
}

function clearDashboardRows() {
  totalRows.value = [];
  providerRows.value = [];
  modelRows.value = [];
  inputTokenRows.value = [];
  outputTokenRows.value = [];
  tokenRows.value = [];
}

async function fetchDashboardData() {
  const currentRequestId = ++requestId;
  loading.value = true;
  error.value = "";

  try {
    const filters = buildFilters();
    const dateFormat = dateGroupFormat.value;
    const [totalData, providerData, modelData, inputTokenData, outputTokenData, tokenData] = await Promise.all([
      AILogProvider.instance.groupBy({fields: ["startedAt"], filters, dateFormat}),
      AILogProvider.instance.groupBy({fields: ["startedAt", "provider"], filters, dateFormat}),
      AILogProvider.instance.groupBy({fields: ["startedAt", "provider", "model"], filters, dateFormat}),
      AILogProvider.instance.groupBy({fields: ["startedAt", "provider", "model", "inputTokens"], filters, dateFormat}),
      AILogProvider.instance.groupBy({fields: ["startedAt", "provider", "model", "outputTokens"], filters, dateFormat}),
      AILogProvider.instance.groupBy({fields: ["startedAt", "provider", "model", "tokens"], filters, dateFormat}),
    ]);

    if (currentRequestId !== requestId) return;

    totalRows.value = toSummaryRows(totalData as AILogGroupByRow[]);
    providerRows.value = toSummaryRows(providerData as AILogGroupByRow[]);
    modelRows.value = toSummaryRows(modelData as AILogGroupByRow[]);
    inputTokenRows.value = toSummaryRows(inputTokenData as AILogGroupByRow[], "inputTokens");
    outputTokenRows.value = toSummaryRows(outputTokenData as AILogGroupByRow[], "outputTokens");
    tokenRows.value = toSummaryRows(tokenData as AILogGroupByRow[], "tokens");
  } catch (fetchError) {
    if (currentRequestId !== requestId) return;

    console.error("Error loading AI log dashboard", fetchError);
    clearDashboardRows();
    error.value = "No se pudo cargar el dashboard de logs de IA.";
  } finally {
    if (currentRequestId === requestId) {
      loading.value = false;
    }
  }
}

function resetFilters() {
  fromDate.value = monthStart;
  toDate.value = today;
  dateGroupFormat.value = "day";
}

watch([fromDate, toDate, dateGroupFormat], () => {
  fetchDashboardData();
}, {immediate: true});
</script>

<template>
  <v-container fluid>
    <div class="ai-log-dashboard">
      <v-card class="ai-log-dashboard__filters" variant="outlined">
        <v-card-item>
          <v-card-title>Dashboard de logs de IA</v-card-title>
          <v-card-subtitle>
            Filtrá por fecha de inicio y agrupá los registros por hora, día, mes o año.
          </v-card-subtitle>
        </v-card-item>

        <v-card-text>
          <v-row align="center">
            <v-col cols="12" md="4" lg="3">
              <v-date-input
                v-model="fromDate"
                label="Iniciado desde"
                variant="outlined"
                hide-details="auto"
                clearable
              />
            </v-col>
            <v-col cols="12" md="4" lg="3">
              <v-date-input
                v-model="toDate"
                label="Iniciado hasta"
                variant="outlined"
                hide-details="auto"
                clearable
              />
            </v-col>
            <v-col cols="12" md="4" lg="3">
              <v-select
                v-model="dateGroupFormat"
                :items="dateGroupOptions"
                label="Agrupar por"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" md="auto" class="ai-log-dashboard__actions">
              <v-btn
                color="primary"
                prepend-icon="mdi-refresh"
                variant="tonal"
                :loading="loading"
                :disabled="loading"
                @click="fetchDashboardData"
              >
                Actualizar
              </v-btn>
              <v-btn
                prepend-icon="mdi-filter-remove-outline"
                variant="text"
                :disabled="loading"
                @click="resetFilters"
              >
                Reiniciar
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-alert
        v-if="error"
        class="my-4"
        type="error"
        variant="tonal"
        density="compact"
      >
        {{ error }}
      </v-alert>

      <v-row class="ai-log-dashboard__cards mt-4">
        <v-col
          v-for="card in cards"
          :key="card.key"
          cols="12"
          md="6"
          class="d-flex"
        >
          <v-card
            class="ai-log-dashboard__card"
            :class="[
              `ai-log-dashboard__card--${card.accent}`,
              {'ai-log-dashboard__card--dark': isDarkTheme},
            ]"
            variant="outlined"
          >
            <div class="ai-log-dashboard__header">
              <div class="ai-log-dashboard__heading">
                <div class="ai-log-dashboard__icon">
                  <v-icon :icon="card.icon" />
                </div>
                <div>
                  <v-card-title class="ai-log-dashboard__title">
                    {{ card.title }}
                  </v-card-title>
                  <div class="ai-log-dashboard__subtitle">
                    {{ formatNumber(getTotalCount(card.rows)) }} logs registrados
                    <template v-if="card.metricLabel">
                      · {{ formatNumber(getTotalMetric(card.rows)) }} {{ card.metricLabel.toLowerCase() }}
                    </template>
                  </div>
                </div>
              </div>

              <div class="ai-log-dashboard__metrics">
                <v-chip class="ai-log-dashboard__metric" size="small" variant="flat">
                  {{ card.rows.length }} filas
                </v-chip>
              </div>
            </div>

            <v-progress-linear
              v-if="loading"
              class="ai-log-dashboard__loader"
              indeterminate
            />
            <v-progress-linear
              v-else
              class="ai-log-dashboard__loader ai-log-dashboard__loader--idle"
              model-value="100"
            />

            <v-table class="ai-log-dashboard__table" density="compact" fixed-header>
              <thead>
                <tr>
                  <th class="text-left">{{ dateGroupHeader }}</th>
                  <th v-if="hasField(card, 'provider')" class="text-left">Provider</th>
                  <th v-if="hasField(card, 'model')" class="text-left">Model</th>
                  <th class="text-right">Cantidad</th>
                  <th v-if="card.metricLabel" class="text-right">{{ card.metricLabel }}</th>
                  <th class="text-right">%</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!loading && card.rows.length === 0">
                  <td
                    class="text-center text-medium-emphasis"
                    :colspan="getColumnCount(card)"
                  >
                    No hay datos para los filtros seleccionados
                  </td>
                </tr>

                <tr v-for="row in card.rows" :key="getRowKey(row, card)">
                  <td class="ai-log-dashboard__date">{{ row.startedAt }}</td>
                  <td v-if="hasField(card, 'provider')">{{ row.provider }}</td>
                  <td v-if="hasField(card, 'model')">
                    <div class="ai-log-dashboard__label">
                      <span>{{ row.model }}</span>
                      <div class="ai-log-dashboard__bar">
                        <div
                          class="ai-log-dashboard__bar-value"
                          :style="{width: `${row.percentage}%`}"
                        />
                      </div>
                    </div>
                  </td>
                  <td class="text-right">{{ formatNumber(row.count) }}</td>
                  <td v-if="card.metricLabel" class="text-right">
                    {{ formatNumber(row.metric ?? 0) }}
                  </td>
                  <td class="text-right">
                    <v-chip class="ai-log-dashboard__percentage" size="x-small" variant="tonal">
                      {{ formatPercentage(row.percentage) }}
                    </v-chip>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="ai-log-dashboard__total">
                  <td><span class="ai-log-dashboard__total-label">Total</span></td>
                  <td v-if="hasField(card, 'provider')"></td>
                  <td v-if="hasField(card, 'model')"></td>
                  <td class="text-right">{{ formatNumber(getTotalCount(card.rows)) }}</td>
                  <td v-if="card.metricLabel" class="text-right">{{ formatNumber(getTotalMetric(card.rows)) }}</td>
                  <td class="text-right">{{ card.rows.length ? "100,0%" : "0,0%" }}</td>
                </tr>
              </tfoot>
            </v-table>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<style scoped>
.ai-log-dashboard {
  width: 100%;
}

.ai-log-dashboard__filters {
  border-color: rgba(var(--v-border-color), .42);
  border-radius: 8px;
}

.ai-log-dashboard__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ai-log-dashboard__cards {
  align-items: stretch;
}

.ai-log-dashboard__card {
  --dashboard-accent: #1565c0;
  --dashboard-accent-soft: #e3f2fd;
  --dashboard-accent-text: #0d47a1;
  --dashboard-accent-readable: var(--dashboard-accent-text);
  --dashboard-chip-bg: rgba(255, 255, 255, .78);
  --dashboard-header-sheen: rgba(255, 255, 255, .8);
  --dashboard-header-surface: rgba(255, 255, 255, .96);
  --dashboard-hover-bg: color-mix(in srgb, var(--dashboard-accent-soft) 42%, white);
  --dashboard-title-color: rgba(var(--v-theme-on-surface), .92);
  --dashboard-total-bg: color-mix(in srgb, var(--dashboard-accent-soft) 56%, white);
  border-color: rgba(var(--v-border-color), .42);
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(30, 42, 55, .08);
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 420px;
  overflow: hidden;
}

.ai-log-dashboard__card--total {
  --dashboard-accent: #455a64;
  --dashboard-accent-soft: #eceff1;
  --dashboard-accent-text: #263238;
}

.ai-log-dashboard__card--provider {
  --dashboard-accent: #00897b;
  --dashboard-accent-soft: #e0f2f1;
  --dashboard-accent-text: #00695c;
}

.ai-log-dashboard__card--model {
  --dashboard-accent: #1976d2;
  --dashboard-accent-soft: #e3f2fd;
  --dashboard-accent-text: #0d47a1;
}

.ai-log-dashboard__card--input {
  --dashboard-accent: #7b1fa2;
  --dashboard-accent-soft: #f3e5f5;
  --dashboard-accent-text: #4a148c;
}

.ai-log-dashboard__card--output {
  --dashboard-accent: #ef6c00;
  --dashboard-accent-soft: #fff3e0;
  --dashboard-accent-text: #e65100;
}

.ai-log-dashboard__card--tokens {
  --dashboard-accent: #2e7d32;
  --dashboard-accent-soft: #e8f5e9;
  --dashboard-accent-text: #1b5e20;
}

.ai-log-dashboard__card--dark {
  --dashboard-accent-readable: color-mix(in srgb, var(--dashboard-accent) 48%, #ffffff);
  --dashboard-accent-soft: color-mix(in srgb, var(--dashboard-accent) 18%, rgb(var(--v-theme-surface)));
  --dashboard-chip-bg: color-mix(in srgb, var(--dashboard-accent) 24%, rgba(0, 0, 0, .82));
  --dashboard-header-sheen: color-mix(in srgb, var(--dashboard-accent) 12%, transparent);
  --dashboard-header-surface: color-mix(in srgb, var(--dashboard-accent) 7%, rgb(var(--v-theme-surface)));
  --dashboard-hover-bg: color-mix(in srgb, var(--dashboard-accent) 14%, rgb(var(--v-theme-surface)));
  --dashboard-title-color: rgba(var(--v-theme-on-surface), .96);
  --dashboard-total-bg: color-mix(in srgb, var(--dashboard-accent) 18%, rgb(var(--v-theme-surface)));
  border-color: rgba(var(--v-border-color), .5);
  box-shadow: 0 14px 32px rgba(0, 0, 0, .28);
}

.ai-log-dashboard__header {
  align-items: flex-start;
  background:
    linear-gradient(135deg, var(--dashboard-accent-soft), var(--dashboard-header-surface) 52%),
    linear-gradient(90deg, var(--dashboard-header-sheen), rgba(255, 255, 255, 0));
  border-bottom: 1px solid rgba(var(--v-border-color), .24);
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 16px;
}

.ai-log-dashboard__heading {
  align-items: center;
  display: flex;
  gap: 12px;
  min-width: 0;
}

.ai-log-dashboard__icon {
  align-items: center;
  background: var(--dashboard-accent);
  border-radius: 8px;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--dashboard-accent) 28%, transparent);
  color: #fff;
  display: flex;
  flex: 0 0 42px;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.ai-log-dashboard__title {
  color: var(--dashboard-title-color);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  padding: 0;
}

.ai-log-dashboard__subtitle {
  color: rgba(var(--v-theme-on-surface), .62);
  font-size: .78rem;
  line-height: 1.4;
  margin-top: 2px;
}

.ai-log-dashboard__metrics {
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ai-log-dashboard__metric {
  background: var(--dashboard-chip-bg);
  color: var(--dashboard-accent-readable);
  font-weight: 700;
}

.ai-log-dashboard__loader {
  color: var(--dashboard-accent);
}

.ai-log-dashboard__loader--idle {
  opacity: .16;
}

.ai-log-dashboard__table {
  flex: 1;
}

.ai-log-dashboard__table :deep(table) {
  min-width: 640px;
}

.ai-log-dashboard__table :deep(th),
.ai-log-dashboard__table :deep(td) {
  white-space: nowrap;
}

.ai-log-dashboard__table :deep(th) {
  background: rgba(var(--v-theme-surface), .96);
  color: rgba(var(--v-theme-on-surface), .66);
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.ai-log-dashboard__table :deep(tbody tr) {
  transition: background-color .16s ease, transform .16s ease;
}

.ai-log-dashboard__table :deep(tbody tr:hover) {
  background: var(--dashboard-hover-bg);
}

.ai-log-dashboard__table :deep(tfoot td) {
  border-top: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.ai-log-dashboard__date {
  color: rgba(var(--v-theme-on-surface), .74);
  font-weight: 600;
}

.ai-log-dashboard__label {
  display: grid;
  gap: 6px;
  min-width: 170px;
}

.ai-log-dashboard__label span {
  font-weight: 600;
}

.ai-log-dashboard__bar {
  background: rgba(var(--v-theme-on-surface), .08);
  border-radius: 999px;
  height: 5px;
  overflow: hidden;
  width: 100%;
}

.ai-log-dashboard__bar-value {
  background: linear-gradient(90deg, var(--dashboard-accent), color-mix(in srgb, var(--dashboard-accent) 62%, white));
  border-radius: inherit;
  height: 100%;
  min-width: 4px;
}

.ai-log-dashboard__percentage {
  color: var(--dashboard-accent-readable);
  font-weight: 700;
}

.ai-log-dashboard__total {
  background: var(--dashboard-total-bg);
  font-weight: 700;
}

.ai-log-dashboard__total-label {
  color: var(--dashboard-accent-readable);
}

@media (max-width: 640px) {
  .ai-log-dashboard__header {
    flex-direction: column;
  }

  .ai-log-dashboard__metrics {
    align-items: flex-start;
  }
}
</style>
