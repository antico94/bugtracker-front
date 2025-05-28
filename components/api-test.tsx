"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ApiTest() {
  const [url, setUrl] = useState(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5285")
  const [endpoint, setEndpoint] = useState("/api/CoreBug")
  const [result, setResult] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const testApi = async () => {
    setLoading(true)
    setResult("")
    setError("")

    try {
      const fullUrl = `${url.endsWith("/") ? url.slice(0, -1) : url}${
        endpoint.startsWith("/") ? endpoint : `/${endpoint}`
      }`
      console.log(`Testing API connection to: ${fullUrl}`)

      const response = await fetch(fullUrl)
      const data = await response.json()

      setResult(JSON.stringify(data, null, 2))
    } catch (err) {
      console.error("API test failed:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Connection Test</CardTitle>
        <CardDescription>Test your API connection to diagnose issues</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="api-url">API Base URL</Label>
            <Input
              id="api-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:5285"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="api-endpoint">API Endpoint</Label>
            <Input
              id="api-endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="/api/CoreBug"
            />
          </div>
          <Button onClick={testApi} disabled={loading}>
            {loading ? "Testing..." : "Test Connection"}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 font-medium">Error:</p>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600 font-medium">Success:</p>
              <pre className="text-xs overflow-auto max-h-60 p-2 bg-black/5 rounded mt-2">{result}</pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
