import { useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate, Link } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthField } from '@/components/auth/AuthField'
import { AuthErrorSummary } from '@/components/auth/AuthErrorSummary'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import { authApi } from '@/services/auth'
import { useAuthStore } from '@/store/useAuthStore'

interface RegisterForm {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export default function Register() {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const setAccessToken = useAuthStore((s) => s.setAccessToken)

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
    mode: 'onBlur',
  })

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.auth-field',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out', delay: 0.15 }
        )
      })
      return () => mm.revert()
    },
    { scope: ref }
  )

  const onSubmit = async (data: RegisterForm) => {
    try {
      const tokens = await authApi.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      })
      setAccessToken(tokens.accessToken)
      navigate('/home')
    } catch {
      setError('root', { message: 'We couldn\u2019t create your account. Try again in a moment.' })
    }
  }

  const handleGoogle = async (code: string) => {
    try {
      const tokens = await authApi.google({ code })
      setAccessToken(tokens.accessToken)
      navigate('/home')
    } catch {
      setError('root', { message: 'Google sign-in didn\u2019t complete. Try again.' })
    }
  }

  return (
    <AuthLayout>
      <div ref={ref}>
        <h1 className="auth-field font-display text-3xl font-medium tracking-tight text-ink">
          Create your account
        </h1>
        <p className="auth-field mt-2 text-sm text-ink/55">
          Already have one?{' '}
          <Link
            to="/login"
            className="rounded font-medium text-brand underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Sign in
          </Link>
        </p>

        <div className="auth-field mt-8">
          <GoogleAuthButton onSuccess={handleGoogle} isLoading={isSubmitting} />
        </div>

        <div className="auth-field divider my-6 text-xs text-ink/40">or</div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <AuthErrorSummary message={errors.root?.message} />

          <div className="auth-field">
            <Controller
              name="fullName"
              control={control}
              rules={{ required: 'Enter your full name' }}
              render={({ field }) => (
                <AuthField
                  label="Full name"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  error={errors.fullName?.message}
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                />
              )}
            />
          </div>

          <div className="auth-field">
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Enter your email address',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
              }}
              render={({ field }) => (
                <AuthField
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  error={errors.email?.message}
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                />
              )}
            />
          </div>

          <div className="auth-field">
            <Controller
              name="password"
              control={control}
              rules={{
                required: 'Choose a password',
                minLength: { value: 8, message: 'Use at least 8 characters' },
                validate: {
                  hasUpper: (v) => /[A-Z]/.test(v) || 'Add at least one uppercase letter',
                  hasNumber: (v) => /[0-9]/.test(v) || 'Add at least one number',
                },
              }}
              render={({ field }) => (
                <AuthField
                  label="Password"
                  type="password"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  hint="At least 8 characters, with one uppercase letter and one number."
                  error={errors.password?.message}
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                />
              )}
            />
          </div>

          <div className="auth-field">
            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: 'Re-enter your password',
                validate: (v) => v === watch('password') || 'This doesn\u2019t match the password above',
              }}
              render={({ field }) => (
                <AuthField
                  label="Confirm password"
                  type="password"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                />
              )}
            />
          </div>

          <div className="auth-field pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn h-12 w-full rounded-xl border-none bg-ink text-base font-semibold text-paper hover:bg-ink/85 disabled:bg-ink/40 disabled:text-paper/70"
            >
              {isSubmitting && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        </form>

        <p className="auth-field mt-6 text-center text-xs text-ink/45">
          By continuing, you agree to Slate's{' '}
          <a href="#" className="rounded underline underline-offset-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
            Terms
          </a>{' '}
          and{' '}
          <a href="#" className="rounded underline underline-offset-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </AuthLayout>
  )
}