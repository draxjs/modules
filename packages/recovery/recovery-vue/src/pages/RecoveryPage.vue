<script setup lang="ts">
import {computed, ref} from "vue";
import {useAuth} from "@drax/identity-vue";
import {RecoveryProvider, type RecoveryOperationResult} from "@drax/recovery-front";

const auth = useAuth();
const activeTab = ref("files");
const dumpPassword = ref("");
const restorePassword = ref("");
const restoreUploadFile = ref<File | File[] | null>(null);
const restoreDrop = ref(true);
const confirmRestore = ref(false);
const fileBackupPassword = ref("");
const fileRestorePassword = ref("");
const fileRestoreUploadFile = ref<File | File[] | null>(null);
const fileRestoreCleanTarget = ref(false);
const confirmFileRestore = ref(false);
const loadingDump = ref(false);
const loadingRestoreUpload = ref(false);
const loadingFileBackup = ref(false);
const loadingFileRestoreUpload = ref(false);
const loadingDownload = ref(false);
const errorMessage = ref("");
const lastResult = ref<RecoveryOperationResult | null>(null);
const hasDumpPermission = computed(() => auth.hasPermission("recovery:dump"));
const hasRestorePermission = computed(() => auth.hasPermission("recovery:restore"));
const hasFileBackupPermission = computed(() => auth.hasPermission("recovery:fileBackup"));
const hasFileRestorePermission = computed(() => auth.hasPermission("recovery:fileRestore"));

const canDump = computed(() => hasDumpPermission.value && Boolean(dumpPassword.value) && !loadingDump.value);
const canRestoreUpload = computed(() => (
  hasRestorePermission.value
  && Boolean(restorePassword.value)
  && Boolean(selectedFile(restoreUploadFile.value))
  && confirmRestore.value
  && !loadingRestoreUpload.value
));
const canFileBackup = computed(() => (
  hasFileBackupPermission.value
  && Boolean(fileBackupPassword.value)
  && !loadingFileBackup.value
));
const canFileRestoreUpload = computed(() => (
  hasFileRestorePermission.value
  && Boolean(fileRestorePassword.value)
  && Boolean(selectedFile(fileRestoreUploadFile.value))
  && confirmFileRestore.value
  && !loadingFileRestoreUpload.value
));
const canDownloadLastResult = computed(() => (
  Boolean(lastResult.value?.archivePath)
  && !loadingDownload.value
  && (
    (lastResult.value?.command === "tar" && hasFileBackupPermission.value)
    || (lastResult.value?.command !== "tar" && hasDumpPermission.value)
  )
));

async function requestDump() {
  loadingDump.value = true;
  errorMessage.value = "";

  try {
    const result = await RecoveryProvider.instance.dump(dumpPassword.value);
    lastResult.value = result;
    dumpPassword.value = "";
    await downloadBackupResult(result);
  } catch (error: any) {
    lastResult.value = null;
    errorMessage.value = error?.message || "No se pudo generar el dump.";
  } finally {
    loadingDump.value = false;
  }
}

async function requestRestoreUpload() {
  const file = selectedFile(restoreUploadFile.value);
  if (!file) {
    return;
  }

  loadingRestoreUpload.value = true;
  errorMessage.value = "";

  try {
    lastResult.value = await RecoveryProvider.instance.restoreUpload(
      restorePassword.value,
      file,
      restoreDrop.value
    );
    restorePassword.value = "";
    restoreUploadFile.value = null;
    confirmRestore.value = false;
  } catch (error: any) {
    lastResult.value = null;
    errorMessage.value = error?.message || "No se pudo ejecutar el restore.";
  } finally {
    loadingRestoreUpload.value = false;
  }
}

async function requestFileBackup() {
  loadingFileBackup.value = true;
  errorMessage.value = "";

  try {
    const result = await RecoveryProvider.instance.fileBackup(fileBackupPassword.value);
    lastResult.value = result;
    fileBackupPassword.value = "";
    await downloadBackupResult(result);
  } catch (error: any) {
    lastResult.value = null;
    errorMessage.value = error?.message || "No se pudo generar el backup de archivos.";
  } finally {
    loadingFileBackup.value = false;
  }
}

async function requestFileRestoreUpload() {
  const file = selectedFile(fileRestoreUploadFile.value);
  if (!file) {
    return;
  }

  loadingFileRestoreUpload.value = true;
  errorMessage.value = "";

  try {
    lastResult.value = await RecoveryProvider.instance.fileRestoreUpload(
      fileRestorePassword.value,
      file,
      fileRestoreCleanTarget.value
    );
    fileRestorePassword.value = "";
    fileRestoreUploadFile.value = null;
    confirmFileRestore.value = false;
  } catch (error: any) {
    lastResult.value = null;
    errorMessage.value = error?.message || "No se pudo ejecutar el restore de archivos.";
  } finally {
    loadingFileRestoreUpload.value = false;
  }
}

async function downloadLastResult() {
  if (!lastResult.value) {
    return;
  }

  loadingDownload.value = true;
  errorMessage.value = "";

  try {
    await downloadResult(lastResult.value);
  } catch (error: any) {
    errorMessage.value = error?.message || "No se pudo descargar el archivo.";
  } finally {
    loadingDownload.value = false;
  }
}

async function downloadBackupResult(result: RecoveryOperationResult): Promise<void> {
  loadingDownload.value = true;

  try {
    await downloadResult(result);
  } catch (error: any) {
    errorMessage.value = error?.message || "Backup generado, pero no se pudo descargar el archivo.";
  } finally {
    loadingDownload.value = false;
  }
}

async function downloadResult(result: RecoveryOperationResult): Promise<void> {
  if (result.command === "tar") {
    await RecoveryProvider.instance.downloadFileBackup(result.archivePath, result.filename);
    return;
  }

  await RecoveryProvider.instance.downloadDump(result.archivePath, result.filename);
}

function selectedFile(value: File | File[] | null): File | null {
  if (Array.isArray(value)) {
    return value[0] || null;
  }

  return value;
}
</script>

<template>
  <v-container fluid class="recovery-page">
    <header class="recovery-header">
      <div class="header-copy">
        <v-avatar class="header-icon" color="primary" variant="tonal" rounded="lg" size="48">
          <v-icon icon="mdi-database-sync-outline" size="28" />
        </v-avatar>
        <div>
          <h1>Recovery</h1>
          <p>Backup y restore de MongoDB y archivos del sistema.</p>
        </div>
      </div>

      <div class="permission-summary">
        <v-chip :color="hasFileBackupPermission && hasFileRestorePermission ? 'success' : 'warning'" variant="tonal" size="small">
          Archivos
        </v-chip>
        <v-chip :color="hasDumpPermission && hasRestorePermission ? 'success' : 'warning'" variant="tonal" size="small">
          MongoDB
        </v-chip>
      </div>
    </header>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-5">
      {{ errorMessage }}
    </v-alert>

    <v-card elevation="0" variant="outlined" class="tabs-card">
      <v-tabs v-model="activeTab" color="primary" density="comfortable">
        <v-tab value="files" prepend-icon="mdi-folder-multiple-outline">
          Archivos
        </v-tab>
        <v-tab value="mongo" prepend-icon="mdi-database-outline">
          MongoDB
        </v-tab>
      </v-tabs>

      <v-divider />

      <v-card-text class="tabs-content">
        <v-window v-model="activeTab">
          <v-window-item value="files">
            <v-row>
        <v-col cols="12" lg="5">
          <v-card elevation="0" class="operation-card">
            <v-card-title class="operation-title">
              <v-avatar class="operation-icon" color="primary" variant="tonal" rounded="lg" size="36">
                <v-icon icon="mdi-folder-arrow-up-outline" />
              </v-avatar>
              <span>Backup de archivos</span>
            </v-card-title>

            <v-card-text class="operation-body">
              <v-alert v-if="!hasFileBackupPermission" type="warning" variant="tonal" density="comfortable">
                Tu usuario no tiene el permiso recovery:fileBackup.
              </v-alert>

              <p class="operation-description">
                Comprime el directorio configurado en <strong>DRAX_FILE_DIR</strong> y guarda el archivo en <strong>recovery-file-backups</strong>.
              </p>

              <v-text-field
                v-model="fileBackupPassword"
                label="Password maestra"
                name="file-backup-master-password"
                type="password"
                variant="outlined"
                autocomplete="new-password"
                autocapitalize="none"
                spellcheck="false"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                data-form-type="other"
                :disabled="loadingFileBackup"
                hide-details="auto"
              />

              <div class="card-actions">
                <v-btn
                  color="primary"
                  prepend-icon="mdi-folder-arrow-up-outline"
                  :loading="loadingFileBackup"
                  :disabled="!canFileBackup"
                  @click="requestFileBackup"
                >
                  Generar backup
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="7">
          <v-card elevation="0" class="operation-card destructive-card">
            <v-card-title class="operation-title">
              <v-avatar class="operation-icon" color="error" variant="tonal" rounded="lg" size="36">
                <v-icon icon="mdi-folder-arrow-down-outline" />
              </v-avatar>
              <span>Restore de archivos</span>
            </v-card-title>

            <v-card-text class="operation-body">
              <v-alert v-if="!hasFileRestorePermission" type="warning" variant="tonal" density="comfortable">
                Tu usuario no tiene el permiso recovery:fileRestore.
              </v-alert>

              <v-alert type="warning" variant="tonal" density="comfortable">
                Restaura sobre el directorio definido en DRAX_FILE_DIR. Puede sobreescribir archivos existentes.
              </v-alert>

              <v-file-input
                v-model="fileRestoreUploadFile"
                label="Archivo a restaurar"
                variant="outlined"
                prepend-icon="mdi-paperclip"
                accept=".tar.gz,.tgz,application/gzip,application/x-gzip"
                :disabled="loadingFileRestoreUpload"
                hide-details="auto"
              />

              <v-text-field
                v-model="fileRestorePassword"
                label="Password maestra"
                name="file-restore-master-password"
                type="password"
                variant="outlined"
                autocomplete="new-password"
                autocapitalize="none"
                spellcheck="false"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                data-form-type="other"
                :disabled="loadingFileRestoreUpload"
                hide-details="auto"
              />

              <div class="option-row">
                <v-switch
                  v-model="fileRestoreCleanTarget"
                  color="primary"
                  label="Limpiar directorio antes de restaurar"
                  :disabled="loadingFileRestoreUpload"
                  hide-details
                />

                <v-checkbox
                  v-model="confirmFileRestore"
                  color="error"
                  label="Confirmo el restore de archivos"
                  :disabled="loadingFileRestoreUpload"
                  hide-details
                />
              </div>

              <div class="card-actions">
                <v-btn
                  color="error"
                  prepend-icon="mdi-upload"
                  :loading="loadingFileRestoreUpload"
                  :disabled="!canFileRestoreUpload"
                  @click="requestFileRestoreUpload"
                >
                  Restaurar
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="mongo">
            <v-row>
        <v-col cols="12" lg="5">
          <v-card elevation="0" class="operation-card">
            <v-card-title class="operation-title">
              <v-avatar class="operation-icon" color="primary" variant="tonal" rounded="lg" size="36">
                <v-icon icon="mdi-database-export-outline" />
              </v-avatar>
              <span>Mongo dump</span>
            </v-card-title>

            <v-card-text class="operation-body">
              <v-alert v-if="!hasDumpPermission" type="warning" variant="tonal" density="comfortable">
                Tu usuario no tiene el permiso recovery:dump.
              </v-alert>

              <p class="operation-description">
                Genera un archivo comprimido dentro de <strong>recovery-dumps</strong> en el backend.
              </p>

              <v-text-field
                v-model="dumpPassword"
                label="Password maestra"
                name="mongo-dump-master-password"
                type="password"
                variant="outlined"
                autocomplete="new-password"
                autocapitalize="none"
                spellcheck="false"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                data-form-type="other"
                :disabled="loadingDump"
                hide-details="auto"
              />

              <div class="card-actions">
                <v-btn
                  color="primary"
                  prepend-icon="mdi-database-export-outline"
                  :loading="loadingDump"
                  :disabled="!canDump"
                  @click="requestDump"
                >
                  Generar dump
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="7">
          <v-card elevation="0" class="operation-card destructive-card">
            <v-card-title class="operation-title">
              <v-avatar class="operation-icon" color="error" variant="tonal" rounded="lg" size="36">
                <v-icon icon="mdi-database-import-outline" />
              </v-avatar>
              <span>Mongo restore</span>
            </v-card-title>

            <v-card-text class="operation-body">
              <v-alert v-if="!hasRestorePermission" type="warning" variant="tonal" density="comfortable">
                Tu usuario no tiene el permiso recovery:restore.
              </v-alert>

              <v-alert type="warning" variant="tonal" density="comfortable">
                El restore puede reemplazar datos existentes. Verifica el archivo antes de continuar.
              </v-alert>

              <v-file-input
                v-model="restoreUploadFile"
                label="Archivo a restaurar"
                variant="outlined"
                prepend-icon="mdi-paperclip"
                accept=".gz,.archive.gz,application/gzip,application/x-gzip"
                :disabled="loadingRestoreUpload"
                hide-details="auto"
              />

              <v-text-field
                v-model="restorePassword"
                label="Password maestra"
                name="mongo-restore-master-password"
                type="password"
                variant="outlined"
                autocomplete="new-password"
                autocapitalize="none"
                spellcheck="false"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                data-form-type="other"
                :disabled="loadingRestoreUpload"
                hide-details="auto"
              />

              <div class="option-row">
                <v-switch
                  v-model="restoreDrop"
                  color="primary"
                  label="Eliminar colecciones antes de restaurar"
                  :disabled="loadingRestoreUpload"
                  hide-details
                />

                <v-checkbox
                  v-model="confirmRestore"
                  color="error"
                  label="Confirmo el restore"
                  :disabled="loadingRestoreUpload"
                  hide-details
                />
              </div>

              <div class="card-actions">
                <v-btn
                  color="error"
                  prepend-icon="mdi-upload"
                  :loading="loadingRestoreUpload"
                  :disabled="!canRestoreUpload"
                  @click="requestRestoreUpload"
                >
                  Restaurar
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>

    <v-card v-if="lastResult" elevation="0" class="result-card">
      <v-card-title class="result-title">
        <span class="result-message">
          <v-icon icon="mdi-check-circle-outline" color="success" />
          {{ lastResult.message }}
        </span>

        <v-btn
          variant="outlined"
          color="primary"
          prepend-icon="mdi-download"
          :loading="loadingDownload"
          :disabled="!canDownloadLastResult"
          @click="downloadLastResult"
        >
          Descargar
        </v-btn>
      </v-card-title>

      <v-card-text class="result-grid">
        <div>
          <span>Operacion</span>
          <strong>{{ lastResult.command }}</strong>
        </div>
        <div>
          <span>Archivo</span>
          <strong>{{ lastResult.filename }}</strong>
        </div>
        <div class="full">
          <span>Ruta</span>
          <v-sheet color="surface-variant" rounded class="result-code">
            <code>{{ lastResult.archivePath }}</code>
          </v-sheet>
        </div>
        <div v-if="lastResult.sourceDirectory" class="full">
          <span>Directorio</span>
          <v-sheet color="surface-variant" rounded class="result-code">
            <code>{{ lastResult.sourceDirectory }}</code>
          </v-sheet>
        </div>
        <div v-if="lastResult.output" class="full">
          <span>Salida</span>
          <v-sheet color="surface-variant" rounded class="result-code">
            <pre>{{ lastResult.output }}</pre>
          </v-sheet>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.recovery-page {
  max-width: 1280px;
  padding-top: 24px;
  padding-bottom: 32px;
}

.recovery-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.header-copy {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon,
.operation-icon {
  flex: 0 0 auto;
}

.header-copy h1 {
  margin: 0;
  font-size: 1.85rem;
  font-weight: 600;
  line-height: 1.15;
}

.header-copy p {
  margin: 6px 0 0;
}

.permission-summary {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.tabs-card {
  border-radius: 8px;
}

.tabs-content {
  padding: 20px;
}

.operation-card {
  height: 100%;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
}

.operation-title {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 62px;
  padding: 18px 20px 12px;
  font-size: 1rem;
  font-weight: 650;
  line-height: 1.2;
}

.operation-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 20px 20px;
}

.operation-description {
  margin: 0;
  line-height: 1.45;
}

.option-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, auto);
  gap: 10px 20px;
  align-items: center;
}

.card-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 2px;
}

.split-actions {
  justify-content: space-between;
}

.result-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.result-card {
  margin-top: 26px;
  border: 1px solid rgba(var(--v-theme-success), .32);
  border-radius: 8px;
}

.result-message {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 1rem;
  font-weight: 650;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.result-grid div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-grid .full {
  grid-column: 1 / -1;
}

.result-grid span {
  font-size: .875rem;
}

.result-code {
  padding: 12px;
}

.result-code code,
.result-code pre {
  display: block;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 960px) {
  .option-row {
    grid-template-columns: 1fr;
  }

  .split-actions {
    justify-content: flex-end;
  }
}

@media (max-width: 600px) {
  .recovery-page {
    padding-top: 16px;
  }

  .recovery-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-copy {
    align-items: flex-start;
  }

  .header-copy h1 {
    font-size: 1.55rem;
  }

  .permission-summary {
    justify-content: flex-start;
  }

  .operation-title {
    padding: 16px 16px 10px;
  }

  .operation-body {
    padding: 0 16px 16px;
  }

  .card-actions .v-btn {
    flex: 1 1 100%;
  }

  .result-grid {
    grid-template-columns: 1fr;
  }
}
</style>
