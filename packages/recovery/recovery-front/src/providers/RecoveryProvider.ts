import {HttpRestClientFactory, type IHttpClient} from "@drax/common-front";

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
  basePath = "/api/recovery"

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
    return await this.httpClient.post(
      `${this.basePath}/dump`,
      {masterPassword},
      {timeout: 1200000}
    ) as RecoveryOperationResult
  }

  async restore(masterPassword: string, archivePath: string, drop: boolean): Promise<RecoveryOperationResult> {
    return await this.httpClient.post(
      `${this.basePath}/restore`,
      {masterPassword, archivePath, drop},
      {timeout: 1200000}
    ) as RecoveryOperationResult
  }

  async restoreUpload(masterPassword: string, file: File, drop: boolean): Promise<RecoveryOperationResult> {
    const formData = new FormData()
    formData.append("masterPassword", masterPassword)
    formData.append("drop", String(drop))
    formData.append("file", file)

    return await this.postMultipart(`${this.basePath}/restore-upload`, formData)
  }

  async downloadDump(archivePath: string, filename: string): Promise<void> {
    await this.download(`${this.basePath}/download`, archivePath, filename)
  }

  async fileBackup(masterPassword: string): Promise<RecoveryOperationResult> {
    return await this.httpClient.post(
      `${this.basePath}/files/backup`,
      {masterPassword},
      {timeout: 1200000}
    ) as RecoveryOperationResult
  }

  async fileRestore(masterPassword: string, archivePath: string, cleanTarget: boolean): Promise<RecoveryOperationResult> {
    return await this.httpClient.post(
      `${this.basePath}/files/restore`,
      {masterPassword, archivePath, cleanTarget},
      {timeout: 1200000}
    ) as RecoveryOperationResult
  }

  async fileRestoreUpload(masterPassword: string, file: File, cleanTarget: boolean): Promise<RecoveryOperationResult> {
    const formData = new FormData()
    formData.append("masterPassword", masterPassword)
    formData.append("cleanTarget", String(cleanTarget))
    formData.append("file", file)

    return await this.postMultipart(`${this.basePath}/files/restore-upload`, formData)
  }

  async downloadFileBackup(archivePath: string, filename: string): Promise<void> {
    await this.download(`${this.basePath}/files/download`, archivePath, filename)
  }

  private async postMultipart(url: string, formData: FormData): Promise<RecoveryOperationResult> {
    const response = await fetch(url, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: formData,
    })

    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload?.message || "No se pudo completar la operacion.")
    }

    return payload as RecoveryOperationResult
  }

  private async download(url: string, archivePath: string, filename: string): Promise<void> {
    const response = await fetch(`${url}?archivePath=${encodeURIComponent(archivePath)}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

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
}

export default RecoveryProvider
