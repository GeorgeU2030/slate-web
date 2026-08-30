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

interface SignInForm {
  email: string
  password: string
}

export default function LogIn() {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const setAccessToken = useAuthStore((s) => s.setAccessToken)

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({
    defaultValues: { email: '', password: '' },
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

  const onSubmit = async (data: SignInForm) => {
    try {
      const tokens = await authApi.login({ email: data.email, password: data.password })
      setAccessToken(tokens.accessToken)
      navigate('/home')
    } catch {
      setError('root', { message: 'That email and password combination didn\u2019t match an account.' })
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
          Welcome back
        </h1>
        <p className="auth-field mt-2 text-sm text-ink/55">
          New to Slate?{' '}
          <Link
            to="/register"
            className="rounded font-medium text-brand underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Create an account
          </Link>
        </p>

        <div className="auth-field mt-8">
          <GoogleAuthButton onSuccess={handleGoogle} isLoading={isSubmitting} label="Sign in with Google" />
        </div>

        <div className="auth-field divider my-6 text-xs text-ink/40">or</div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <AuthErrorSummary message={errors.root?.message} />

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
              rules={{ required: 'Enter your password' }}
              render={({ field }) => (
                <AuthField
                  label="Password"
                  type="password"
                  placeholder="Your password"
                  autoComplete="current-password"
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

          <div className="auth-field pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn h-12 w-full rounded-xl border-none bg-ink text-base font-semibold text-paper hover:bg-ink/85 disabled:bg-ink/40 disabled:text-paper/70"
            >
              {isSubmitting && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}