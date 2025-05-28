"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { FileText, Users, ArrowRight, Trash2, AlertTriangle } from "lucide-react"
import type { StudyResponseDto } from "@/types"

interface StudyCardProps {
  study: StudyResponseDto
  onDelete: (study: StudyResponseDto) => Promise<void>
}

export function StudyCard({ study, onDelete }: StudyCardProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onDelete(study)
      setShowDeleteDialog(false)
    } catch (error) {
      console.error("Failed to delete study:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 to-primary" />

        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="line-clamp-1 text-xl font-semibold tracking-tight group-hover:text-primary">
                {study.name}
              </h3>
              <p className="text-sm text-muted-foreground">Protocol: {study.protocol}</p>
            </div>
            <Badge variant="outline" className="px-2 py-1 text-xs">
              {study.interactiveResponseTechnologies?.length || 0} IRTs
            </Badge>
          </div>

          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <p className="line-clamp-2">{study.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{study.client?.name}</span>
          </div>

          {study.tasks && study.tasks.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Tasks Progress</span>
                <span className="text-xs text-muted-foreground">
                  {study.tasks.filter((t) => t.status === "Completed").length}/{study.tasks.length}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${study.tasks.length ? (study.tasks.filter((t) => t.status === "Completed").length / study.tasks.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t bg-muted/40 px-6 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              setShowDeleteDialog(true)
            }}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="group/btn"
            onClick={() => router.push(`/studies/${study.studyId}`)}
          >
            View Details
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the study <span className="font-medium">{study.name}</span>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Study"}
            </Button>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
