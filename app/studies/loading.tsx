import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/page-header"
import { PageShell } from "@/components/page-shell"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title="Studies">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </PageHeader>
      <PageShell>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full" />
          ))}
        </div>
      </PageShell>
    </div>
  )
}
