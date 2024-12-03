interface IDraxExportResult {
  status: 'success' | 'error',
  destinationPath: string,
  fileName: string,
  filePath: string,
  relativeFilePath: string,
  rowCount: number,
  time: number,
  message: string

}

export type {IDraxExportResult}
