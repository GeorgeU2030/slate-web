import { useId, useState } from 'react'
import { Icon } from '@iconify/react'

interface AuthFieldProps {
  label: string
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  autoComplete?: string
  hint?: string
  error?: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: () => void
  inputRef?: React.Ref<HTMLInputElement>
}

export function AuthField({
  label,
  type = 'text',
  placeholder,
  autoComplete,
  hint,
  error,
  name,
  value,
  onChange,
  onBlur,
  inputRef,
}: AuthFieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const [revealed, setRevealed] = useState(false)

  const isPassword = type === 'password'
  const resolvedType = isPassword && revealed ? 'text' : type

  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

  return (
    <fieldset className="fieldset w-full gap-0 p-0">
      <label htmlFor={id} className="fieldset-legend px-0 pb-1.5 text-xs font-medium uppercase tracking-wide text-ink/55">
        {label}
      </label>

      <div
        className={`input flex h-12 w-full items-center gap-2 rounded-xl border bg-paper px-4 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand ${
          error ? 'border-brand-bright' : 'border-ink/15 focus-within:border-ink/35'
        }`}
      >
        <input
          id={id}
          ref={inputRef}
          name={name}
          type={resolvedType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          className="grow bg-transparent text-sm text-ink placeholder:text-ink/30 focus:outline-none"
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink/40 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <Icon icon={revealed ? 'ph:eye-slash' : 'ph:eye'} className="text-lg" />
          </button>
        )}
      </div>

      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-ink/45">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-brand-bright">
          <Icon icon="ph:warning-circle-fill" className="shrink-0 text-sm" aria-hidden="true" />
          {error}
        </p>
      )}
    </fieldset>
  )
}