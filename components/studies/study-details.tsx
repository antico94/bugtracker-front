"use client"

import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { StudyResponseDto } from "@/types"

interface StudyDetailsProps {
  study: StudyResponseDto
  onClose: () => void
}

export function StudyDetails({ study, onClose }: StudyDetailsProps) {
  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>{study.name}</DialogTitle>
      </DialogHeader>

      <div className="grid gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Protocol</h3>
          <p className="mt-1">{study.protocol}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
          <p className="mt-1">{study.description}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
          <p className="mt-1">{study.client?.name}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Trial Manager</h3>
          <p className="mt-1">{study.trialManager?.version}</p>
        </div>

        {study.interactiveResponseTechnologies && study.interactiveResponseTechnologies.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Interactive Response Technologies</h3>
            <div className="mt-1 flex flex-wrap gap-2">
              {study.interactiveResponseTechnologies.map((irt) => (
                <Badge key={irt.interactiveResponseTechnologyId} variant="outline">
                  {irt.version}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {study.tasks && study.tasks.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Tasks</h3>
            <div className="mt-1">
              <ul className="list-inside list-disc">
                {study.tasks.map((task) => (
                  <li key={task.taskId}>
                    {task.taskTitle}{" "}
                    <Badge variant={task.status === "Completed" ? "success" : "secondary"} className="ml-2">
                      {task.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  )
}
