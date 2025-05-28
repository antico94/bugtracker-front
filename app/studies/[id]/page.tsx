"use client"
import { useRouter } from "next/navigation"
import { useStudy } from "@/hooks/use-studies"
import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Calendar, ExternalLink, FileText, Users, Beaker, CheckCircle, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { StudyResponseDto } from "@/types"

export default function StudyDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: study, loading, error, refetch } = useStudy(params.id)

  if (loading) {
    return <StudyDetailsSkeleton />
  }

  if (error || !study) {
    return (
      <div className="flex min-h-screen flex-col">
        <PageHeader title="Study Details">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Studies
          </Button>
        </PageHeader>
        <PageShell>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-4 text-xl font-medium">Failed to load study details</p>
            <p className="mb-6 text-muted-foreground">
              The study you're looking for might not exist or there was an error loading it.
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

  return <StudyDetails study={study} />
}

function StudyDetails({ study }: { study: StudyResponseDto }) {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title={study.name}>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-sm">
            Protocol: {study.protocol}
          </Badge>
          <Button variant="outline" onClick={() => router.push("/studies")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Studies
          </Button>
        </div>
      </PageHeader>

      <PageShell>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-4 w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="irts">IRTs</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-relaxed text-muted-foreground">{study.description}</p>
                  </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Client Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Client Name</h3>
                          <p className="text-lg font-medium">{study.client?.name}</p>
                        </div>
                        {study.client?.description && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Client Description</h3>
                            <p className="text-sm">{study.client.description}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Beaker className="h-5 w-5 text-primary" />
                        Trial Manager
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Version</h3>
                          <p className="text-lg font-medium">{study.trialManager?.version}</p>
                        </div>
                        {study.trialManager?.jiraKey && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{study.trialManager.jiraKey}</Badge>
                            {study.trialManager?.jiraLink && (
                              <a
                                href={study.trialManager.jiraLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-xs text-primary hover:underline"
                              >
                                View in Jira
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-6">
                {study.tasks && study.tasks.length > 0 ? (
                  <div className="grid gap-4">
                    {study.tasks.map((task) => (
                      <Card key={task.taskId} className="overflow-hidden">
                        <div
                          className={`h-1 w-full ${task.status === "Completed" ? "bg-green-500" : "bg-amber-500"}`}
                        />
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            {task.status === "Completed" ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-amber-500" />
                            )}
                            <div>
                              <p className="font-medium">{task.taskTitle}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>Created: {formatDate(task.createdAt)}</span>
                                {task.completedAt && (
                                  <>
                                    <span>•</span>
                                    <span>Completed: {formatDate(task.completedAt)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge variant={task.status === "Completed" ? "success" : "secondary"}>{task.status}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="mb-4 rounded-full bg-muted p-3">
                        <CheckCircle className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="mb-2 text-lg font-medium">No Tasks</h3>
                      <p className="text-sm text-muted-foreground">This study doesn't have any tasks yet.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="irts" className="space-y-6">
                {study.interactiveResponseTechnologies && study.interactiveResponseTechnologies.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {study.interactiveResponseTechnologies.map((irt) => (
                      <Card key={irt.interactiveResponseTechnologyId}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Version {irt.version}</CardTitle>
                          {irt.jiraKey && <CardDescription>Jira: {irt.jiraKey}</CardDescription>}
                        </CardHeader>
                        <CardContent>
                          {irt.webLink && (
                            <a
                              href={irt.webLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm text-primary hover:underline"
                            >
                              View Web Link
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="mb-4 rounded-full bg-muted p-3">
                        <Beaker className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="mb-2 text-lg font-medium">No IRTs</h3>
                      <p className="text-sm text-muted-foreground">
                        This study doesn't have any Interactive Response Technologies yet.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Study Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Protocol</h3>
                  <p className="text-lg font-medium">{study.protocol}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
                  <p className="font-mono text-sm text-muted-foreground">{study.studyId}</p>
                </div>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/studies/edit/${study.studyId}`)}
                  >
                    Edit Study
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Related Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">IRTs</span>
                  <Badge variant="outline">{study.interactiveResponseTechnologies?.length || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tasks</span>
                  <Badge variant="outline">{study.tasks?.length || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Completed Tasks</span>
                  <Badge variant="outline">{study.tasks?.filter((t) => t.status === "Completed").length || 0}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageShell>
    </div>
  )
}

function StudyDetailsSkeleton() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title={<Skeleton className="h-8 w-64" />}>
        <Button variant="outline" onClick={() => router.push("/studies")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Studies
        </Button>
      </PageHeader>

      <PageShell>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-4 flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageShell>
    </div>
  )
}
