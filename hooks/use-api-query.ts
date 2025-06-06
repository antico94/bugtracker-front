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

// Function-based overload (existing)
export function useApiQuery<T>(
  queryFn: () => Promise<T>,
  deps?: DependencyList
): ApiQueryState<T>

// Object-based overload (new)
export function useApiQuery<T>(
  options: ApiQueryOptions
): ApiQueryState<T>

export function useApiQuery<T>(
  queryFnOrOptions: (() => Promise<T>) | ApiQueryOptions,
  deps: DependencyList = []
): ApiQueryState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Determine if using function or options API
  const isOptionsAPI = typeof queryFnOrOptions === 'object'
  const options = isOptionsAPI ? queryFnOrOptions as ApiQueryOptions : null
  const queryFn = isOptionsAPI ? null : queryFnOrOptions as () => Promise<T>
  const enabled = options?.enabled ?? true
  
  // Use refs to prevent infinite loops
  const queryFnRef = useRef(queryFn)
  const isMounted = useRef(true)
  const isFirstRender = useRef(true)
  
  // Store the actual dependencies in a ref to compare them
  const previousDepsRef = useRef<DependencyList>(deps)
  
  // Only update the queryFn ref if it changes
  useEffect(() => {
    if (queryFn) {
      queryFnRef.current = queryFn
    }
  }, [queryFn])
  
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
      
      let result: T
      
      if (isOptionsAPI && options) {
        // Handle options API - create a repository instance and call the endpoint
        const repository = new BaseRepository()
        result = await repository.get<T>(options.endpoint)
      } else if (queryFnRef.current) {
        // Handle function API
        result = await queryFnRef.current()
      } else {
        throw new Error("No query function or options provided")
      }
      
      if (isMounted.current) {
        setData(result)
        setLoading(false)
      }
      
      return result
    } catch (err) {
      console.error("API Query Error:", err)
      
      if (isMounted.current) {
        // Better error messages for common issues
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
  }, [isOptionsAPI, options, enabled]) // Add dependencies

  // Only run the effect if deps have changed
  useEffect(() => {
    if (!enabled) return
    
    if (isOptionsAPI) {
      // For options API, use queryKey as dependencies
      fetchData()
    } else {
      // For function API, use provided deps
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
    }
  }, isOptionsAPI ? (options?.queryKey || []) : deps)

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}
