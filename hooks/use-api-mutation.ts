"use client"

import { useState, useCallback } from "react"
import { BaseRepository } from '../repositories/base-repository'

export interface ApiMutationState<T, V = void> {
  data: T | null
  loading: boolean
  error: string | null
  mutate: (variables?: V) => Promise<T>
  reset: () => void
  isLoading: boolean
}

export interface ApiMutationOptions<T, V = void> {
  endpoint: string
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

// Function-based mutation hook
function useApiMutationWithFunction<T, V = void>(mutationFn: (variables: V) => Promise<T>): ApiMutationState<T, V> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(
    async (variables: V): Promise<T> => {
      try {
        setLoading(true)
        setError(null)
        const result = await mutationFn(variables)
        setData(result)
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred"
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [mutationFn],
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    mutate,
    reset,
    isLoading: loading,
  }
}

// Object-based mutation hook
function useApiMutationWithOptions<T, V = void>(options: ApiMutationOptions<T, V>): ApiMutationState<T, V> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(
    async (variables: V): Promise<T> => {
      try {
        setLoading(true)
        setError(null)
        
        const repository = new BaseRepository()
        let result: T
        
        switch (options.method || 'POST') {
          case 'POST':
            result = await repository.post<T>(options.endpoint, variables)
            break
          case 'PUT':
            result = await repository.put<T>(options.endpoint, variables)
            break
          case 'PATCH':
            result = await repository.patch<T>(options.endpoint, variables)
            break
          case 'DELETE':
            result = await repository.delete<T>(options.endpoint)
            break
          default:
            result = await repository.post<T>(options.endpoint, variables)
        }
        
        setData(result)
        
        // Call onSuccess callback if provided
        if (options.onSuccess) {
          options.onSuccess(result)
        }
        
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("An error occurred")
        const errorMessage = error.message
        setError(errorMessage)
        
        // Call onError callback if provided
        if (options.onError) {
          options.onError(error)
        }
        
        throw error
      } finally {
        setLoading(false)
      }
    },
    [options],
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    mutate,
    reset,
    isLoading: loading,
  }
}

// Function-based overload (existing)
export function useApiMutation<T, V = void>(
  mutationFn: (variables: V) => Promise<T>
): ApiMutationState<T, V>

// Object-based overload (new)
export function useApiMutation<T, V = void>(
  options: ApiMutationOptions<T, V>
): ApiMutationState<T, V>

// Implementation with robust type checking
export function useApiMutation<T, V = void>(
  mutationFnOrOptions: ((variables: V) => Promise<T>) | ApiMutationOptions<T, V>
): ApiMutationState<T, V> {
  // Robust check to distinguish between function and options
  const isFunction = typeof mutationFnOrOptions === 'function'
  
  if (isFunction) {
    return useApiMutationWithFunction(mutationFnOrOptions as (variables: V) => Promise<T>)
  } else {
    return useApiMutationWithOptions(mutationFnOrOptions as ApiMutationOptions<T, V>)
  }
}
