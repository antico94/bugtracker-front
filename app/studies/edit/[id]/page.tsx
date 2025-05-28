"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useStudy, useStudies } from "@/hooks/use-studies"
import { useClients } from "@/hooks/use-clients"
import { useTrialManagers } from "@/hooks/use-trial-managers"
import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, AlertCircle, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { UpdateStudyDto } from "@/types"

export default function EditStudyPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: study, loading, error, refetch } = useStudy(params.id)
  const { update, updateLoading } = useStudies()
  const { clients } = useClients()
  const { trialManagers } = useTrialManagers()

  const [formData, setFormData] = useState<UpdateStudyDto>({
    name: "",
    protocol: "",
    description: "",
  })

  useEffect(() => {
    if (study) {
      setFormData({
        name: study.name || "",
        protocol: study.protocol || "",
        description: study.description || "",
      })
    }
  }, [study])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await update({ id: params.id, data: formData })
      toast({
        title: "Study updated",
        description: "The study has been updated successfully.",
      })
      router.push(`/studies/${params.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update study. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <EditStudySkeleton />
  }

  if (error || !study) {
    return (
      <div className="flex min-h-screen flex-col">
        <PageHeader title="Edit Study">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </PageHeader>
        <PageShell>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-4 text-xl font-medium">Failed to load study</p>
            <p className="mb-6 text-muted-foreground">
              The study you're trying to edit might not exist or there was an error loading it.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => refetch()}>Try Again</Button>
              <Button variant="outline" onClick={() => router.push("/studies")}>
                Back to Studies
              </Button>
            </div>
          </div>
        </PageShell>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title={`Edit Study: ${study.name}`}>
        <Button variant="outline" onClick={() => router.push(`/studies/${study.studyId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Study
        </Button>
      </PageHeader>

      <PageShell>
        <form onSubmit={handleSubmit}>
          <Card className="mx-auto max-w-3xl">
            <CardHeader>
              <CardTitle>Study Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Study Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="protocol">Protocol</Label>
                <Input id="protocol" name="protocol" value={formData.protocol} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  required
                />
              </div>

              <div className="grid gap-6 pt-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Client</Label>
                  <div className="rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                    {study.client?.name || "No client assigned"}
                  </div>
                  <p className="text-xs text-muted-foreground">Client cannot be changed after creation</p>
                </div>

                <div className="space-y-2">
                  <Label>Trial Manager</Label>
                  <div className="rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                    {study.trialManager?.version || "No trial manager assigned"}
                  </div>
                  <p className="text-xs text-muted-foreground">Trial manager cannot be changed after creation</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.push(`/studies/${study.studyId}`)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateLoading}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </form>
      </PageShell>
    </div>
  )
}

function EditStudySkeleton() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title={<Skeleton className="h-8 w-64" />}>
        <Button variant="outline" onClick={() => router.push("/studies")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </PageHeader>

      <PageShell>
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-32 w-full" />
            </div>

            <div className="grid gap-6 pt-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </PageShell>
    </div>
  )
}
