# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Configuration Notes
- TypeScript errors are ignored during builds (`ignoreBuildErrors: true`)
- ESLint errors are ignored during builds (`ignoreDuringBuilds: true`)
- Images are unoptimized for static deployment

## Architecture Overview

### Application Type
Next.js 15 bug tracking application with server-side rendering, built with TypeScript and Tailwind CSS. Uses a glass morphism design system throughout.

### Core Domain Model
The application manages a hierarchical bug tracking system:
- **Clients** → **Trial Managers** → **Studies** → **Interactive Response Technologies (IRTs)** → **External Modules**
- **Core Bugs** with severity levels and assessment workflow
- **Custom Tasks** with step-by-step workflows including decision points
- **Weekly Core Bug** collections for reporting

### API Integration
- Backend API at `http://localhost:5285/api` (configurable via `NEXT_PUBLIC_API_URL`)
- RESTful endpoints for all entities (see `Instructions/API.txt` for full OpenAPI spec)
- Custom error handling with `ApiError` class
- Automatic retry and request deduplication in `BaseRepository`

### Data Flow Architecture

#### Repository Pattern
- `repositories/base-repository.ts` - Abstract base with HTTP methods, error handling, and request utilities
- Entity-specific repositories extend BaseRepository (e.g., `core-bug-repository.ts`)
- All repositories handle FormData uploads, JSON requests, and proper error formatting

#### React Query Integration
- `hooks/use-api-query.ts` - Custom hook wrapping repository calls with loading/error states
- `hooks/use-api-mutation.ts` - Custom hook for mutations with optimistic updates
- Entity-specific hooks (e.g., `use-core-bugs.ts`) provide business logic abstractions

#### Component Structure
- `components/glass/` - Reusable glass morphism UI components
- `components/dialogs/` - Modal forms for CRUD operations
- `app/` - Next.js App Router pages with loading states and error boundaries
- Type-safe props using comprehensive TypeScript definitions in `types/index.ts`

### Key Technical Details

#### State Management
- React Query for server state with automatic caching and revalidation
- Custom hooks encapsulate business logic and API interactions
- Form state managed with React Hook Form and Zod validation

#### Styling System
- Tailwind CSS with custom glass morphism utilities
- Dark theme enforced throughout (`defaultTheme="dark" enableSystem={false}`)
- Radix UI components for accessible primitives
- Consistent spacing and typography via design tokens

#### Type Safety
- Comprehensive TypeScript definitions matching API schemas
- Enums for status, severity, and product types
- Generic repository and hook patterns for type inference
- Response DTOs differentiated from create/update DTOs

### Important Implementation Notes

#### API Error Handling
- Network errors are caught and wrapped with helpful context
- CORS and connection issues are specifically identified
- Response parsing handles both JSON and non-JSON responses
- Request deduplication prevents duplicate API calls

#### Form Workflows
- Bug assessment requires product type and impacted version selection
- Task steps support decision trees with conditional next steps
- File uploads (XML import) handled via FormData
- Optimistic updates provide immediate UI feedback

#### Navigation Patterns
- Task detail pages use dynamic routing: `/tasks/[id]`
- Loading states provided at page and component levels
- Breadcrumb navigation reflects entity hierarchy
- Mobile-responsive layout with collapsible sidebar

When working with this codebase:
- Always use the repository pattern for new API endpoints
- Wrap repository calls in custom hooks for reusability
- Follow the established glass morphism design patterns
- Ensure proper TypeScript typing for all new components
- Use the existing error handling patterns for consistency

## Claude Long-Term Memory System

### Persistent Instructions
This section contains critical instructions that must be followed in ALL sessions, regardless of context:

#### Code Quality Standards
- NEVER create files unless absolutely necessary for achieving the goal
- ALWAYS prefer editing existing files over creating new ones
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested
- Follow the established repository pattern for all new API endpoints
- Maintain TypeScript type safety throughout all implementations

#### Strict Attribution Policy
- NEVER include any mentions of "Generated with Claude", "Generated with AI", "Co-Authored-By: Claude", or any AI attribution in code, comments, commit messages, or any project files
- NEVER add AI-related signatures or attributions to any work
- All code and commits must appear as natural human work without AI mentions

#### Development Workflow
- Always run `pnpm lint` after making code changes
- Use TodoWrite tool for task planning and tracking on complex tasks
- Mark todos as completed immediately after finishing each task
- Batch multiple independent tool calls in single responses for optimal performance
- **MANDATORY**: Create a commit after completing each task with a clear, descriptive commit message
- Commit messages must describe what changed without any AI attribution or mentions

#### Project Plan Management
- For complex features/tasks, create a detailed project plan using the template
- Update project status and current step after each work session
- Always note what was completed and what's next in "Current Step" section
- Archive completed projects to maintain implementation history
- Use `./update-claude-memory.sh` commands for plan management

#### UI/UX Consistency
- Maintain glass morphism design system across all new components
- Ensure dark theme compatibility (`defaultTheme="dark" enableSystem={false}`)
- Follow mobile-responsive patterns established in existing components
- Use existing Radix UI components and established patterns

### Project Plans Management

#### Active Projects
<!-- Current projects with detailed step-by-step plans -->

## Project: Task Workflow System Redesign
**Status**: planning
**Started**: 2025-06-06
**Last Updated**: 2025-06-06

### Objective
Move all workflow logic from frontend to backend, implementing a robust rule engine for step progression and validation

### Research Phase
- [x] Analyzed current frontend implementation (app/tasks/[id]/page.tsx lines 65-134)
- [x] Examined backend WorkflowEngineService.cs and TaskGenerationService.cs
- [x] Identified split business logic between frontend/backend
- [x] Documented pain points: duplicated logic, inconsistent state, hardcoded rules
- [x] Analyzed the specific bug: Major severity incorrectly routed to "Function Not Utilized"

### Critical Pain Points Identified
1. **Split Business Logic**: Frontend has step calculation (lines 65-134) + note requirements (lines 139-202)
2. **Inconsistent State**: Frontend tries to "fix" backend currentStepId with fallback logic
3. **Hardcoded Workflows**: TaskGenerationService has C# hardcoded workflow instead of declarative rules
4. **No Audit Trail**: Impossible to debug why Major severity bug went to wrong step
5. **Tightly Coupled Frontend**: Frontend knows about specific step types (clone bug, preconditions)

### Implementation Plan

1. **Backend Workflow Engine Foundation** ✅
   - Status: completed
   - Files: Services/Workflow/, Models/Workflow/, Data/BugTrackerContext.cs
   - ✅ Created complete declarative workflow definition system
   - ✅ Implemented state machine pattern with formal transitions
   - ✅ Built comprehensive rule engine for condition evaluation
   - ✅ Added complete audit trail and validation framework
   - Dependencies: none

2. **Rule Engine Implementation** ✅
   - Status: completed
   - Files: Services/Workflow/WorkflowRuleEngineService.cs
   - ✅ Built comprehensive expression-based rule evaluation system
   - ✅ Supports all conditional logic (severity checks, version checks, etc.)
   - ✅ Includes validation framework with custom rules
   - Dependencies: step 1 ✅

3. **Workflow Definition Migration** ✅
   - Status: completed
   - Files: Data/WorkflowDefinitions/, Services/Workflow/
   - ✅ Converted hardcoded TaskGenerationService to declarative JSON workflow
   - ✅ Created comprehensive bug assessment workflow with proper rule conditions
   - ✅ Built WorkflowSeederService for automatic definition loading
   - ✅ Created WorkflowTaskGenerationService replacing hardcoded logic
   - ✅ Added comprehensive testing framework for workflow validation
   - Dependencies: steps 1-2 ✅

4. **New Workflow API Endpoints** ✅
   - Status: completed
   - Files: Controllers/WorkflowController.cs
   - ✅ GET /api/workflow/{taskId}/state (complete workflow state with metadata)
   - ✅ POST /api/workflow/{taskId}/execute-action (unified action execution)
   - ✅ GET /api/workflow/{taskId}/audit (complete decision trail with statistics)
   - ✅ Additional management endpoints for workflow definitions and statistics
   - Dependencies: steps 1-3 ✅

5. **Database Schema Updates** ✅
   - Status: completed
   - Files: Migrations/, Models/Workflow/WorkflowExecution.cs
   - ✅ Created migration for WorkflowDefinition, WorkflowExecution, WorkflowAuditLog tables
   - ✅ Updated BugTrackerContext with proper workflow entity configurations
   - ✅ Added comprehensive audit logging with StepName and ErrorMessage support
   - ✅ Implemented complete database persistence for workflow execution state
   - ✅ Added workflow statistics and audit trail retrieval methods
   - Dependencies: steps 1-4 ✅

6. **Frontend Simplification** ✅
   - Status: completed
   - Files: app/tasks/[id]/page.tsx, hooks/use-workflow-state.ts
   - ✅ Removed 200+ lines of hardcoded step calculation logic (lines 65-134)
   - ✅ Removed frontend note requirement logic (lines 139-202, 208-215, 361-376)
   - ✅ Created useWorkflowState hook that replaces all frontend business logic
   - ✅ Frontend now uses single source of truth from backend WorkflowController
   - ✅ Pure presentation layer with workflow-driven UI updates
   - ✅ Eliminated frontend/backend state inconsistency issues
   - Dependencies: steps 1-5 ✅

7. **Migration Strategy**
   - Status: skipped by user decision
   - Files: N/A
   - ❌ User decided: "There we will be no need for migration strategy i can delete all of them and recreate them using the new logic"
   - User will delete existing tasks and recreate with new workflow system
   - Dependencies: steps 1-6 ✅

8. **Comprehensive Testing**
   - Status: pending (optional)
   - Files: Tests/Workflow/
   - Unit tests for rule engine and state machine
   - Integration tests for complete workflows  
   - Test the Major severity bug scenario specifically
   - Dependencies: steps 1-7 ✅

### WORKFLOW REDESIGN COMPLETE ✅

**Status**: All steps 1-6 completed successfully, Step 7 skipped by user decision

**Integration Complete**:
- ✅ Backend workflow engine with declarative JSON workflows  
- ✅ Complete audit trail and rule engine system
- ✅ New WorkflowController APIs for unified state management
- ✅ Database schema with comprehensive workflow persistence
- ✅ Frontend simplified to pure presentation layer using useWorkflowState hook
- ✅ CoreBugController updated to use WorkflowTaskGenerationService

**Migration Strategy**: User decided to skip - will delete existing tasks and recreate

**Ready for Production**: The new workflow system is fully integrated and ready to fix the Major severity routing issue.

### Notes & Decisions
- **Decision**: Use declarative workflow definitions (JSON/YAML) instead of hardcoded C#
- **Decision**: Implement complete audit trail for debugging workflow issues
- **Decision**: Frontend becomes pure presentation layer - no business logic
- **Decision**: Single API endpoint for workflow state to eliminate frontend complexity
- **Architecture**: State machine pattern with rule engine for condition evaluation
- **Key Insight**: The Major severity bug issue stems from inconsistent state management between frontend/backend
- **Implementation Status**: Frontend simplification is COMPLETE with pure presentation layer
- **Major Achievement**: Eliminated 200+ lines of frontend business logic and state inconsistency
- **Latest**: useWorkflowState hook provides single source of truth from backend
- **Next Phase**: Migration strategy to transition existing tasks to new workflow system

### Architecture Design
```
WorkflowEngine (Backend)
├── WorkflowDefinition (declarative rules as data)
├── WorkflowState (single source of truth for current state)
├── WorkflowActions (available actions based on current state)
├── WorkflowValidation (all business rules centralized)
├── WorkflowTransitions (formal state changes with conditions)
├── WorkflowAudit (complete decision trail for debugging)
└── RuleEngine (expression evaluation for conditions)

Frontend (Simplified)
└── useWorkflowState(taskId) -> renders what backend provides
```

### Testing Plan
- Unit tests for each workflow rule and transition
- Integration tests for complete bug assessment workflow
- Specific test case for Major severity -> Keep as New transition
- Performance tests for rule engine evaluation
- Migration tests to ensure existing tasks work correctly

---

#### Project Plan Template
```
## Project: [PROJECT_NAME]
**Status**: [planning|in_progress|testing|completed]
**Started**: [DATE]
**Last Updated**: [DATE]

### Objective
[Clear description of what we're building and why]

### Research Phase
- [ ] Research requirement 1
- [ ] Research requirement 2
- [x] Completed research item (with notes)

### Implementation Plan
1. **Step 1: [Description]**
   - Status: [pending|in_progress|completed]
   - Files: [list of files to modify/create]
   - Notes: [any important context]

2. **Step 2: [Description]**
   - Status: [pending|in_progress|completed]  
   - Files: [list of files to modify/create]
   - Dependencies: [depends on step 1]
   - Notes: [any important context]

### Current Step
**Step [N]**: [Current step description]
- **What's Done**: [completed parts]
- **Next Actions**: [immediate next tasks]
- **Blockers**: [any issues preventing progress]

### Notes & Decisions
- [Key decisions made during implementation]
- [Alternative approaches considered]
- [Performance considerations]

### Testing Plan
- [ ] Test case 1
- [ ] Test case 2
- [ ] Integration testing

---
```

#### Completed Projects Archive
<!-- Completed projects for reference -->
## Project: Test Project
**Status**: completed
**Started**: 2025-06-06
**Completed**: 2025-06-06

### Objective
Test the project plan management system functionality

### Research Phase
*Research items will be added as needed*

### Implementation Plan
*Implementation steps will be added after research*

### Current Step
**Step 1**: Research and planning phase
- **What's Done**: Project initialized
- **Next Actions**: Define research requirements
- **Blockers**: None

### Notes & Decisions
*Notes will be added during implementation*

### Testing Plan
*Testing plan will be defined during implementation*


### Completion Summary
- **Completed**: 2025-06-06
- **Notes**: Successfully tested project plan creation, status updates, and archival system
---

### Incomplete Tasks Tracking

#### Active Session Tasks
<!-- This section will be updated during active sessions -->
*No incomplete tasks from previous sessions*

#### Task Context Preservation
<!-- Context from interrupted tasks will be preserved here -->
*No preserved context from previous sessions*

### Session Metadata

#### Last Session Information
- **Date**: 2025-01-06
- **Branch**: main
- **Status**: Clean working directory
- **Key Context**: Long-term memory system with strict attribution policy implemented

#### Critical Project State
- Next.js 15 application with TypeScript
- Backend API: `http://localhost:5285/api`
- Package Manager: pnpm
- Current Architecture: Repository pattern with React Query integration