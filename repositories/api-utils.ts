export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export function isApiError(error: any): error is ApiError {
  return error instanceof ApiError
}

// Utility functions for common operations
export const ApiUtils = {
  // Format date for API calls
  formatDate(date: Date): string {
    return date.toISOString()
  },

  // Parse date from API response
  parseDate(dateString: string): Date {
    return new Date(dateString)
  },

  // Build enum query parameter
  buildEnumParam<T extends Record<string, string>>(enumValue: T[keyof T] | undefined): string | undefined {
    return enumValue as string | undefined
  },

  // Validate GUID format
  isValidGuid(guid: string): boolean {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return guidRegex.test(guid)
  },

  // Download file from blob response
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },

  // Handle file upload
  createFileFormData(file: File, fieldName = "file"): FormData {
    const formData = new FormData()
    formData.append(fieldName, file)
    return formData
  },
}
