interface PlaceholderProps {
  title: string
  description: string
  details?: string
}

export function Placeholder({ title, description, details }: PlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      {details && <p className="max-w-md text-sm text-muted-foreground">{details}</p>}
    </div>
  )
}
