// repositories/base-repository.ts - FIXED VERSION

export abstract class BaseRepository {
  protected baseUrl: string

  constructor(baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5285/api") {
    // Remove trailing slash and ensure we have the base API URL
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Clean endpoint - remove leading slash since baseUrl should include /api
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint
    const url = `${this.baseUrl}/${cleanEndpoint}`

    // Prevent duplicate requests for the same URL with the same method
    const requestKey = `${options.method || 'GET'}-${url}-${JSON.stringify(options.body || {})}`
    
    // Handle FormData (for file uploads) vs JSON
    const isFormData = options.body instanceof FormData

    const config: RequestInit = {
      headers: {
        // Only set Content-Type for non-FormData requests
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`

        try {
          // Try to get error details from response
          const contentType = response.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json()
            errorMessage += `: ${errorData.message || errorData.title || JSON.stringify(errorData)}`
          } else {
            const errorText = await response.text()
            errorMessage += `: ${errorText}`
          }
        } catch (parseError) {
          // If we can't parse the error, just use the status
          errorMessage += `: ${response.statusText}`
        }

        throw new ApiError(errorMessage, response.status, response)
      }

      // Handle empty responses (like 204 No Content)
      if (response.status === 204 || response.headers.get("content-length") === "0") {
        return {} as T
      }

      // Handle non-JSON responses (like file downloads)
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return await response.json()
      } else {
        // For file downloads or other binary content
        return response as unknown as T
      }
    } catch (error) {
      console.error(`API request failed: ${url}`, error)

      // Network errors (CORS, connection refused, etc.)
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new ApiError(
          `Network error: Could not connect to API at ${url}. Check if the server is running and CORS is configured.`,
          0
        )
      }

      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
        throw error
      }

      // Wrap other errors
      throw new ApiError(
        error instanceof Error ? error.message : "Unknown error occurred",
        0
      )
    }
  }

  protected async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  protected async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const body = data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined)
    return this.request<T>(endpoint, {
      method: "POST",
      body,
    })
  }

  protected async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const body = data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined)
    return this.request<T>(endpoint, {
      method: "PUT",
      body,
    })
  }

  protected async delete<T>(endpoint: string, data?: unknown): Promise<T> {
    const body = data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined)
    return this.request<T>(endpoint, {
      method: "DELETE",
      body,
    })
  }

  protected buildQueryString(params: Record<string, unknown>): string {
    const filteredParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => {
        // Handle arrays (for multiple values)
        if (Array.isArray(value)) {
          return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&')
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      })

    return filteredParams.length > 0 ? `?${filteredParams.join("&")}` : ""
  }
}

// Custom error class for better error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
