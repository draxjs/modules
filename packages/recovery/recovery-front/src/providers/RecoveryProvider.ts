import {HttpRestClientFactory, type IHttpClient} from "@drax/common-front";

const RECOVERY_TIMEOUT_MS = 60 * 60 * 1000;

export type RecoveryOperationResult = {
  success: boolean
  message: string
  archivePath: string
  filename: string
  command: "mongodump" | "mongorestore" | "tar"
  sourceDirectory?: string
  output: string
}

class RecoveryProvider {
  static singleton: RecoveryProvider

  httpClient: IHttpClient
  mongoBasePath = "/api/recovery/mongo"
  fileBasePath = "/api/recovery/files"

  constructor() {
    this.httpClient = HttpRestClientFactory.getInstance()
  }

  static get instance() {
    if (!RecoveryProvider.singleton) {
      RecoveryProvider.singleton = new RecoveryProvider()
    }
    return RecoveryProvider.singleton
  }

  async dump(masterPassword: string): Promise<RecoveryOperationResult> {
    return await this.postJson(`${this.mongoBasePath}/dump`, {masterPassword})
  }

  async restoreUpload(masterPassword: string, file: File, drop: boolean): Promise<RecoveryOperationResult> {
    const formData = new FormData()
    formData.append("masterPassword", masterPassword)
    formData.append("drop", String(drop))
    formData.append("file", file)

    return await this.postMultipart(`${this.mongoBasePath}/restore-upload`, formData)
  }

  async downloadDump(archivePath: string, filename: string): Promise<void> {
    await this.download(`${this.mongoBasePath}/download`, archivePath, filename)
  }

  async fileBackup(masterPassword: string): Promise<RecoveryOperationResult> {
    return await this.postJson(`${this.fileBasePath}/backup`, {masterPassword})
  }

  async fileRestoreUpload(masterPassword: string, file: File, cleanTarget: boolean): Promise<RecoveryOperationResult> {
    const formData = new FormData()
    formData.append("masterPassword", masterPassword)
    formData.append("cleanTarget", String(cleanTarget))
    formData.append("file", file)

    return await this.postMultipart(`${this.fileBasePath}/restore-upload`, formData)
  }

  async downloadFileBackup(archivePath: string, filename: string): Promise<void> {
    await this.download(`${this.fileBasePath}/download`, archivePath, filename)
  }

  private async postMultipart(url: string, formData: FormData): Promise<RecoveryOperationResult> {
    const response = await this.fetchWithTimeout(url, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: formData,
    }, RECOVERY_TIMEOUT_MS)

    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload?.message || "No se pudo completar la operacion.")
    }

    return payload as RecoveryOperationResult
  }

  private async postJson(url: string, body: Record<string, unknown>): Promise<RecoveryOperationResult> {
    const response = await this.fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(body),
    }, RECOVERY_TIMEOUT_MS)

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(payload?.message || payload?.error || "No se pudo completar la operacion.")
    }

    return payload as RecoveryOperationResult
  }

  private async download(url: string, archivePath: string, filename: string): Promise<void> {
    const response = await this.fetchWithTimeout(`${url}?archivePath=${encodeURIComponent(archivePath)}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    }, RECOVERY_TIMEOUT_MS)

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      throw new Error(payload?.message || "No se pudo descargar el archivo.")
    }

    const blob = await response.blob()
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(link.href)
  }

  private getAuthHeaders(): HeadersInit {
    const authStoreString = localStorage.getItem("AuthStore")
    if (!authStoreString) {
      return {}
    }

    const authStore = JSON.parse(authStoreString)
    return authStore?.accessToken ? {Authorization: `Bearer ${authStore.accessToken}`} : {}
  }

  private async fetchWithTimeout(url: string, init: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), timeout)

    try {
      return await fetch(url, {
        ...init,
        signal: controller.signal,
      })
    } finally {
      window.clearTimeout(timeoutId)
    }
  }
}

export default RecoveryProvider
