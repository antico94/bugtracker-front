// repositories/api-utils.ts
export class ApiUtils {
  static downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  static handleApiError(error: unknown): string {
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>
      if (errorObj.response && typeof errorObj.response === 'object') {
        const response = errorObj.response as Record<string, unknown>
        if (response.data && typeof response.data === 'object') {
          const data = response.data as Record<string, unknown>
          if (typeof data.message === 'string') {
            return data.message
          }
        }
      }
      if (typeof errorObj.message === 'string') {
        return errorObj.message
      }
    }
    return 'An unexpected error occurred'
  }

  static buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item.toString()))
        } else {
          searchParams.append(key, value.toString())
        }
      }
    })

    return searchParams.toString()
  }

  static isValidUrl(string: string): boolean {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  static validateFile(file: File, allowedTypes: string[], maxSize?: number): { isValid: boolean; error?: string } {
    // Check file type
    if (!allowedTypes.includes(file.type) && !allowedTypes.some(type => file.name.endsWith(type.replace('*/', '.')))) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      }
    }

    // Check file size
    if (maxSize && file.size > maxSize) {
      return {
        isValid: false,
        error: `File size too large. Maximum size is ${this.formatFileSize(maxSize)}`
      }
    }

    return { isValid: true }
  }
}