import { Icon } from '@iconify/react'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-paper-line bg-paper-dim/40 px-6 py-16 text-center">
      <Icon icon={icon} className="mx-auto text-4xl text-ink/25" aria-hidden="true" />
      <p className="mt-4 font-display text-base font-medium text-ink">{title}</p>
      <p className="mx-auto mt-1.5 max-w-xs text-sm text-ink-soft">{description}</p>
      {action && (
        <button onClick={action.onClick} className="btn btn-primary btn-sm mt-5 rounded-lg px-5">
          {action.label}
        </button>
      )}
    </div>
  )
}