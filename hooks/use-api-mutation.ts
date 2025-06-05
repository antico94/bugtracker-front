"use client"

import { useState, useCallback } from "react"

export interface ApiMutationState<T, V = void> {
  data: T | null
  loading: boolean
  error: string | null
  mutate: (variables?: V) => Promise<T>
  reset: () => void
}

export function useApiMutation<T, V = void>(mutationFn: (variables: V) => Promise<T>): ApiMutationState<T, V> {
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
  }
}
