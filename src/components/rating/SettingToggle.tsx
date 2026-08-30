import { useId } from 'react'
import { Icon } from '@iconify/react'

interface SettingToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  title: string
  description: string
  icon: string
}

export function SettingToggle({ checked, onChange, title, description, icon }: SettingToggleProps) {
  const id = useId()

  return (
    <label
      htmlFor={id}
      className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-paper-line bg-paper p-4 transition-colors hover:border-ink/20 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand"
    >
      <div className="flex min-w-0 items-center gap-3">
        <Icon
          icon={icon}
          className={`shrink-0 text-xl transition-colors ${checked ? 'text-brand' : 'text-ink/35'}`}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">{title}</p>
          <p className="mt-0.5 text-xs leading-snug text-ink-soft">{description}</p>
        </div>
      </div>

      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="toggle toggle-primary shrink-0"
      />
    </label>
  )
}