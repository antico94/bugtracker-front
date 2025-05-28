import type { PaginatedResponse } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

async function fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      let errorMessage = "An error occurred"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

export function get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) {
  const queryString = params
    ? `?${Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join("&")}`
    : ""

  return fetchWithErrorHandling<T>(`${API_BASE_URL}/${endpoint}${queryString}`)
}

export function getPaginated<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined> & { page?: number; pageSize?: number },
) {
  const queryString = params
    ? `?${Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join("&")}`
    : ""

  return fetchWithErrorHandling<PaginatedResponse<T>>(`${API_BASE_URL}/${endpoint}${queryString}`)
}

export function post<T, U = any>(endpoint: string, data: U) {
  return fetchWithErrorHandling<T>(`${API_BASE_URL}/${endpoint}`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function put<T, U = any>(endpoint: string, data: U) {
  return fetchWithErrorHandling<T>(`${API_BASE_URL}/${endpoint}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export function del<T>(endpoint: string) {
  return fetchWithErrorHandling<T>(`${API_BASE_URL}/${endpoint}`, {
    method: "DELETE",
  })
}
