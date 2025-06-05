"use client"

import { useMemo } from "react"

// Import all repositories with absolute paths
import type { BaseRepository } from "@/repositories/base-repository"
import { ClientRepository } from "@/repositories/client-repository"
import { TrialManagerRepository } from "@/repositories/trial-manager-repository"
import { StudyRepository } from "@/repositories/study-repository"
import { IRTRepository } from "@/repositories/irt-repository"
import { ExternalModuleRepository } from "@/repositories/external-module-repository"
import { CoreBugRepository } from "@/repositories/core-bug-repository"
import { CustomTaskRepository } from "@/repositories/custom-task-repository"
import { WeeklyCoreBugsRepository } from "@/repositories/weekly-core-bugs-repository"
import { WorkflowRepository } from "@/repositories/workflow-repository"

// Repository Registry
export class RepositoryRegistry {
  private static instance: RepositoryRegistry

  public readonly clients: ClientRepository
  public readonly trialManagers: TrialManagerRepository
  public readonly studies: StudyRepository
  public readonly irts: IRTRepository
  public readonly externalModules: ExternalModuleRepository
  public readonly coreBugs: CoreBugRepository
  public readonly customTasks: CustomTaskRepository
  public readonly weeklyCoreBugs: WeeklyCoreBugsRepository
  public readonly workflow: WorkflowRepository

  private constructor(baseUrl?: string) {
    const apiUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5285/api"

    this.clients = new ClientRepository(apiUrl)
    this.trialManagers = new TrialManagerRepository(apiUrl)
    this.studies = new StudyRepository(apiUrl)
    this.irts = new IRTRepository(apiUrl)
    this.externalModules = new ExternalModuleRepository(apiUrl)
    this.coreBugs = new CoreBugRepository(apiUrl)
    this.customTasks = new CustomTaskRepository(apiUrl)
    this.weeklyCoreBugs = new WeeklyCoreBugsRepository(apiUrl)
    this.workflow = new WorkflowRepository(apiUrl)
  }

  public static getInstance(baseUrl?: string): RepositoryRegistry {
    if (!RepositoryRegistry.instance) {
      RepositoryRegistry.instance = new RepositoryRegistry(baseUrl)
    }
    return RepositoryRegistry.instance
  }

  public static create(baseUrl?: string): RepositoryRegistry {
    return new RepositoryRegistry(baseUrl)
  }
}

// Export types
export type { BaseRepository }

// Export default instance
export const repositories = RepositoryRegistry.getInstance()

// Hook for React applications
export function useRepositories(baseUrl?: string) {
  return useMemo(() => {
    if (baseUrl) {
      return RepositoryRegistry.create(baseUrl)
    }
    return repositories
  }, [baseUrl])
}
