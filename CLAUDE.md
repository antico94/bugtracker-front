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