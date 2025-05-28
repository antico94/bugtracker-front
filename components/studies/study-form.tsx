"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useClients } from "@/hooks/use-clients"
import { useTrialManagers } from "@/hooks/use-trial-managers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"
import type { CreateStudyDto } from "@/types"

interface StudyFormProps {
  onSubmit: (data: CreateStudyDto) => Promise<void>
  isLoading?: boolean
}

export function StudyForm({ onSubmit, isLoading = false }: StudyFormProps) {
  const router = useRouter()
  const { clients, loading: clientsLoading } = useClients()
  const { trialManagers, loading: managersLoading } = useTrialManagers()

  const [formData, setFormData] = useState<CreateStudyDto>({
    name: "",
    protocol: "",
    description: "",
    clientId: "",
    trialManagerId: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await onSubmit(formData)
      toast({
        title: "Study created",
        description: "The study has been created successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create study. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredTrialManagers = trialManagers.filter(
    (manager) => !formData.clientId || manager.clientId === formData.clientId,
  )

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-none shadow-none">
        <CardContent className="space-y-6 p-0">
          <div className="space-y-2">
            <Label htmlFor="name">Study Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter study name"
              required
              className="transition-all focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="protocol">Protocol</Label>
            <Input
              id="protocol"
              name="protocol"
              value={formData.protocol}
              onChange={handleChange}
              placeholder="Enter protocol identifier"
              required
              className="transition-all focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter study description"
              rows={4}
              required
              className="resize-none transition-all focus-visible:ring-primary"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => handleSelectChange("clientId", value)}
                disabled={clientsLoading}
                required
              >
                <SelectTrigger id="clientId" className="transition-all focus:ring-primary">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.clientId} value={client.clientId}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trialManagerId">Trial Manager</Label>
              <Select
                value={formData.trialManagerId}
                onValueChange={(value) => handleSelectChange("trialManagerId", value)}
                disabled={managersLoading || !formData.clientId}
                required
              >
                <SelectTrigger id="trialManagerId" className="transition-all focus:ring-primary">
                  <SelectValue placeholder={formData.clientId ? "Select a trial manager" : "Select a client first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredTrialManagers.map((manager) => (
                    <SelectItem key={manager.trialManagerId} value={manager.trialManagerId}>
                      {manager.version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 p-0 pt-6">
          <Button type="button" variant="outline" onClick={() => router.push("/studies")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Study
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
