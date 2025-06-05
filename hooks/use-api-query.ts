"use client"

import { useState, useEffect, useCallback, useRef, DependencyList } from "react"

export interface ApiQueryState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<T | null>
}

export function useApiQuery<T>(
  queryFn: () => Promise<T>,
  deps: DependencyList = []
): ApiQueryState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Use refs to prevent infinite loops
  const queryFnRef = useRef(queryFn)
  const isMounted = useRef(true)
  const isFirstRender = useRef(true)
  
  // Store the actual dependencies in a ref to compare them
  const previousDepsRef = useRef<DependencyList>(deps)
  
  // Only update the queryFn ref if it changes
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
  }, []) // Empty dependency array to prevent recreation

  // Only run the effect if deps have changed
  useEffect(() => {
    // Skip the first render to prevent double fetching with React strict mode
    if (isFirstRender.current) {
      isFirstRender.current = false
      
      // Initial fetch
      fetchData()
      return
    }
    
    // Check if deps have actually changed
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
