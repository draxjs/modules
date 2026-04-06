interface IDraxImportResult {
  status: 'success' | 'error',
  rowCount: number,
  successCount?: number,
  errorCount?: number,
  time: number,
  message: string,
  fileName?: string,
  url?: string
}

export type {IDraxImportResult}
