import { SearchField } from '@/design-system/components/SearchField'
import { cn } from '@/shared/utils/cn'

interface HeaderGlobalSearchProps {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}

export function HeaderGlobalSearch({
  value,
  onValueChange,
  open,
  onOpenChange,
  className,
}: HeaderGlobalSearchProps) {
  return (
    <SearchField
      value={value}
      onValueChange={onValueChange}
      open={open}
      onOpenChange={onOpenChange}
      placeholder="Search workspace…"
      aria-label="Search trips, clients, suppliers, and reminders"
      density="toolbar"
      className={cn(className)}
    />
  )
}
