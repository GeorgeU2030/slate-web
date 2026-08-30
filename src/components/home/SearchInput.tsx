import { useId } from 'react'
import { Icon } from '@iconify/react'

interface SearchInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClear?: () => void
  placeholder?: string
  label: string
  className?: string
}

export function SearchInput({ value, onChange, onClear, placeholder, label, className = '' }: SearchInputProps) {
  const id = useId()

  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="input flex h-11 w-full items-center gap-2.5 rounded-xl border border-ink/15 bg-paper px-4 transition-colors focus-within:border-ink/35 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand">
        <Icon icon="ph:magnifying-glass" className="shrink-0 text-lg text-ink/35" aria-hidden="true" />
        <input
          id={id}
          type="search"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
          className="grow bg-transparent text-sm text-ink placeholder:text-ink/35 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="-mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink/35 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <Icon icon="ph:x" className="text-base" />
          </button>
        )}
      </div>
    </div>
  )
}