"use client"

import { useState, useEffect, useCallback, useRef, DependencyList } from "react"
import { BaseRepository } from '../repositories/base-repository'

export interface ApiQueryState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<T | null>
}

export interface ApiQueryOptions {
  queryKey: string[]
  endpoint: string
  enabled?: boolean
  method?: string
}

// Create separate hooks to avoid complexity and bugs
function useApiQueryWithFunction<T>(
  queryFn: () => Promise<T>,
  deps: DependencyList = []
): ApiQueryState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const queryFnRef = useRef(queryFn)
  const isMounted = useRef(true)
  const isFirstRender = useRef(true)
  const previousDepsRef = useRef<DependencyList>(deps)
  
  // Update the queryFn ref when it changes
  useEffect(() => {
    queryFnRef.current = queryFn
  }, [queryFn])
  
  // Set up cleanup
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const fetchData = useCallback(async (): Promise<T | null> => {
    if (!isMounted.current) return null
    
    try {
      setLoading(true)
      setError(null)
      
      const result = await queryFnRef.current()
      
      if (isMounted.current) {
        setData(result)
        setLoading(false)
      }
      
      return result
    } catch (err) {
      console.error("API Query Error:", err)
      
      if (isMounted.current) {
        let errorMessage = "An error occurred"
        if (err instanceof Error) {
          if (err.message.includes("Failed to fetch")) {
            errorMessage = "Unable to connect to the server. Please check if the backend is running."
          } else if (err.message.includes("404")) {
            errorMessage = err.message
          } else {
            errorMessage = err.message
          }
        }
        
        setError(errorMessage)
        setData(null)
        setLoading(false)
      }
      
      return null
    }
  }, [])

  // Handle dependency changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      fetchData()
      return
    }
    
    const depsChanged = deps.some((dep, i) => dep !== previousDepsRef.current[i])
    
    if (depsChanged) {
      previousDepsRef.current = deps
      fetchData()
    }
  }, deps)

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

function useApiQueryWithOptions<T>(options: ApiQueryOptions): ApiQueryState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const isMounted = useRef(true)
  const enabled = options.enabled ?? true
  
  // Set up cleanup
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const fetchData = useCallback(async (): Promise<T | null> => {
    if (!isMounted.current || !enabled) return null
    
    try {
      setLoading(true)
      setError(null)
      
      const repository = new BaseRepository()
      const result = await repository.get<T>(options.endpoint)
      
      if (isMounted.current) {
        setData(result)
        setLoading(false)
      }
      
      return result
    } catch (err) {
      console.error("API Query Error:", err)
      
      if (isMounted.current) {
        let errorMessage = "An error occurred"
        if (err instanceof Error) {
          if (err.message.includes("Failed to fetch")) {
            errorMessage = "Unable to connect to the server. Please check if the backend is running."
          } else if (err.message.includes("404")) {
            errorMessage = err.message
          } else {
            errorMessage = err.message
          }
        }
        
        setError(errorMessage)
        setData(null)
        setLoading(false)
      }
      
      return null
    }
  }, [options.endpoint, enabled])

  // Trigger fetch when queryKey changes
  useEffect(() => {
    if (enabled) {
      fetchData()
    }
  }, [...(options.queryKey || []), enabled])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

// Function-based overload (existing)
export function useApiQuery<T>(
  queryFn: () => Promise<T>,
  deps?: DependencyList
): ApiQueryState<T>

// Object-based overload (new)
export function useApiQuery<T>(
  options: ApiQueryOptions
): ApiQueryState<T>

// Implementation with robust type checking
export function useApiQuery<T>(
  queryFnOrOptions: (() => Promise<T>) | ApiQueryOptions,
  deps: DependencyList = []
): ApiQueryState<T> {
  // Robust check to distinguish between function and options
  const isFunction = typeof queryFnOrOptions === 'function'
  
  if (isFunction) {
    return useApiQueryWithFunction(queryFnOrOptions as () => Promise<T>, deps)
  } else {
    return useApiQueryWithOptions(queryFnOrOptions as ApiQueryOptions)
  }
}
