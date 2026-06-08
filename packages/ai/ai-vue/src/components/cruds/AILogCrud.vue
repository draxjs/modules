
<script setup lang="ts">
import AILogCrud from '../../cruds/AILogCrud'
import {Crud} from "@drax/crud-vue";
import {formatDateTime} from "@drax/common-front"

interface PrettyJson {
  value: string
  isJson: boolean
}

const prettyJson = (value: unknown): PrettyJson => {
  if (value === null || value === undefined) {
    return {value: '', isJson: false}
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim()

    if (!trimmedValue) {
      return {value, isJson: false}
    }

    try {
      return {
        value: JSON.stringify(JSON.parse(trimmedValue), null, 2),
        isJson: true
      }
    } catch {
      return {value, isJson: false}
    }
  }

  try {
    return {
      value: JSON.stringify(value, null, 2),
      isJson: true
    }
  } catch {
    return {value: String(value), isJson: false}
  }
}

</script>

<template>
  <crud :entity="AILogCrud.instance">
    <template v-slot:item.startedAt="{value}">{{formatDateTime(value)}}</template>
    <template v-slot:item.endedAt="{value}">{{formatDateTime(value)}}</template>
    <template v-slot:item.tenant="{value}">{{value?.name}}</template>
    <template v-slot:item.user="{value}">{{value?.username}}</template>

    <template v-slot:field.input="{field, modelValue}">
      <div class="ai-log-json-field">
        <div class="ai-log-json-field__label">{{ field.label }}</div>
        <pre
          :class="[
            'ai-log-json-field__content',
            {'ai-log-json-field__content--json': prettyJson(modelValue).isJson}
          ]"
        >{{ prettyJson(modelValue).value }}</pre>
      </div>
    </template>

    <template v-slot:field.output="{field, modelValue}">
      <div class="ai-log-json-field">
        <div class="ai-log-json-field__label">{{ field.label }}</div>
        <pre
          :class="[
            'ai-log-json-field__content',
            {'ai-log-json-field__content--json': prettyJson(modelValue).isJson}
          ]"
        >{{ prettyJson(modelValue).value }}</pre>
      </div>
    </template>

    <template v-slot:toolbar-left>
      <v-btn
        icon="mdi-view-dashboard-outline"
        variant="text"
        :to="{name: 'DraxAILogDashboardPage'}"
      />
    </template>
  </crud>
</template>

<style scoped>
.ai-log-json-field {
  width: 100%;
}

.ai-log-json-field__label {
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-size: 0.75rem;
  line-height: 1rem;
  margin-bottom: 6px;
}

.ai-log-json-field__content {
  background: rgba(var(--v-theme-surface-variant), 0.28);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 6px;
  color: rgb(var(--v-theme-on-surface));
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.82rem;
  line-height: 1.45;
  margin: 0;
  max-height: 520px;
  min-height: 88px;
  overflow: auto;
  padding: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.ai-log-json-field__content--json {
  background: rgb(var(--v-theme-surface));
  white-space: pre;
}
</style>
