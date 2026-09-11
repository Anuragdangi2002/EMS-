import { useState, useEffect, useMemo, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LoaderCircle, Eye, EyeOff } from 'lucide-react'
import { api, unwrap } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { useAuth } from '../store/auth-context'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
})

const passwordSchema = z.string()
  .min(8, 'Must be at least 8 characters')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/[0-9]/, 'Include a number')
  .regex(/[^a-zA-Z0-9]/, 'Include a special character')

function LiveClock() {
  const [timeStr, setTimeStr] = useState('')
  const [dateStr, setDateStr] = useState('Loading date…')

  useEffect(() => {
    function updateClock() {
      const now = new Date()
      setTimeStr(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }))
      setDateStr(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }))
    }
    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="font-mono">
      <div className="text-2xl font-medium tracking-tight text-white sm:text-3xl">{timeStr || '--:--:--'}</div>
      <div className="mt-0.5 sm:mt-1 text-[0.7rem] sm:text-xs tracking-wider text-white/50">{dateStr}</div>
    </div>
  )
}

function RosterGrid() {
  const delays = useMemo(() => {
    return Array.from({ length: 48 }, () => (Math.random() * 2.6).toFixed(2) + 's')
  }, [])

  return (
    <div className="mt-10 grid max-w-[420px] grid-cols-12 gap-[7px]" aria-hidden="true">
      {delays.map((delay, idx) => (
        <i
          key={idx}
          className="roster-grid-item block aspect-square w-full rounded-[3px]"
          style={{ animationDelay: delay }}
        />
      ))}
    </div>
  )
}

function AuthShell({
  kicker = "Employee portal",
  title,
  subtitle,
  children,
}: {
  kicker?: string
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[#F7F8FA] lg:flex-row">
      {/* LEFT: brand stage */}
      <section className="relative flex flex-col justify-between overflow-hidden bg-[#0F1A2B] p-6 sm:p-10 lg:p-14 text-white lg:min-h-screen lg:flex-[1.15]">
        {/* Background gradient glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(600px 400px at 15% 10%, rgba(61,217,196,0.14), transparent 60%),
              radial-gradient(500px 400px at 90% 85%, rgba(255,182,72,0.10), transparent 60%)
            `
          }}
        />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-2.5 font-grotesk text-base sm:text-lg font-semibold tracking-wide">
          <div className="flex size-[30px] items-center justify-center rounded-lg bg-gradient-to-br from-[#3DD9C4] to-[#1FA391] font-mono text-xs font-bold text-[#0F1A2B]">
            PO
          </div>
          PeopleOps
        </div>

        {/* Stage mid */}
        <div className="relative z-10 my-6 sm:my-8 max-w-[480px] lg:my-0">
          <div className="mb-3.5 sm:mb-5 flex items-center gap-2 font-mono text-[0.68rem] sm:text-[0.72rem] uppercase tracking-[0.14em] text-[#3DD9C4]">
            <span className="size-1.5 rounded-full bg-[#3DD9C4] shadow-[0_0_0_4px_rgba(61,217,196,0.18)]" />
            Workforce · Online
          </div>
          <h1 className="font-grotesk text-2xl font-semibold leading-[1.15] tracking-tight sm:text-4xl lg:text-[2.55rem]">
            Every shift,<br />
            <em className="not-italic text-[#3DD9C4]">accounted for.</em>
          </h1>
          <p className="mt-3 sm:mt-4 max-w-[400px] text-xs sm:text-sm leading-relaxed text-white/60 sm:text-base">
            Clock in, review your roster, and manage your team from one place — built for the pace of a real workday.
          </p>

          <div className="hidden lg:block">
            <RosterGrid />
          </div>
        </div>

        {/* Stage foot */}
        <div className="relative z-10 flex items-end justify-between gap-4 pt-3 sm:pt-4 sm:gap-8">
          <LiveClock />
          <div className="flex flex-col gap-1 sm:gap-[0.55rem] text-right font-mono text-[0.7rem] sm:text-xs text-white/55">
            <span>
              <strong className="font-medium text-[#3DD9C4]">248</strong> checked in today
            </span>
            <span>
              Uptime <strong className="font-medium text-[#3DD9C4]">99.98%</strong>
            </span>
          </div>
        </div>
      </section>

      {/* RIGHT: form side */}
      <section className="flex flex-1 items-center justify-center bg-[#F7F8FA] px-4 py-8 sm:p-12 lg:p-10">
        <div className="w-full max-w-[380px]">
          <div className="mb-6 sm:mb-8">
            <div className="mb-2 font-mono text-[0.68rem] sm:text-[0.72rem] uppercase tracking-[0.12em] text-[#6B7280]">
              {kicker}
            </div>
            <h1 className="font-grotesk text-xl font-semibold tracking-tight text-[#12141C] sm:text-2xl lg:text-[1.75rem]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#6B7280]">
                {subtitle}
              </p>
            )}
          </div>

          {children}

          {/* ID hint box */}
          <div className="mt-6 sm:mt-[2.4rem] flex gap-2.5 rounded-[10px] border border-[rgba(61,217,196,0.25)] bg-[rgba(61,217,196,0.08)] p-3 sm:p-3.5 font-mono text-[0.72rem] sm:text-xs leading-relaxed text-[#0F6B5E]">
            <span>ⓘ</span>
            <span>Your Employee ID is on your onboarding letter and printed on your access badge.</span>
          </div>
        </div>
      </section>
    </main>
  )
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema)
  })

  const submit = form.handleSubmit(async values => {
    try {
      const user = await login(values.email, values.password)
      toast.success('Welcome back')
      navigate(user.role === 'EMPLOYEE' ? '/attendance' : '/')
    } catch {
      toast.error('Unable to sign in. Check your credentials.')
    }
  })

  return (
    <AuthShell
      kicker="Employee portal"
      title="Sign in to PeopleOps"
      subtitle="Enter your work credentials to continue."
    >
      <form onSubmit={submit} className="space-y-[1.15rem]">
        {/* Email / Employee ID field */}
        <div>
          <label htmlFor="empId" className="mb-1.5 block text-xs font-medium text-[#12141C]">
            Employee ID or email
          </label>
          <div className="relative">
            <input
              id="empId"
              type="email"
              autoComplete="username"
              placeholder="e.g. EMP-04521 or you@company.com"
              className="w-full rounded-[10px] border border-[#E4E7EC] bg-white px-[0.95rem] py-[0.8rem] text-sm text-[#12141C] outline-none transition placeholder:text-[#B4B8C2] focus:border-[#3DD9C4] focus:ring-4 focus:ring-[rgba(61,217,196,0.14)]"
              {...form.register('email')}
            />
          </div>
          {form.formState.errors.email?.message && (
            <p className="mt-1 text-xs text-[#FF6B6B]">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Password field */}
        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-[#12141C]">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full rounded-[10px] border border-[#E4E7EC] bg-white py-[0.8rem] pl-[0.95rem] pr-[4.5rem] text-sm text-[#12141C] outline-none transition placeholder:text-[#B4B8C2] focus:border-[#3DD9C4] focus:ring-4 focus:ring-[rgba(61,217,196,0.14)]"
              {...form.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6B7280] hover:text-[#12141C] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3DD9C4]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {form.formState.errors.password?.message && (
            <p className="mt-1 text-xs text-[#FF6B6B]">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {/* Remember me & Forgot Password */}
        <div className="my-[1.3rem] flex items-center justify-between text-xs sm:text-sm">
          <label className="flex cursor-pointer select-none items-center gap-2 text-[#6B7280]">
            <input
              type="checkbox"
              className="size-4 cursor-pointer accent-[#3DD9C4]"
              {...form.register('remember')}
            />
            Keep me signed in
          </label>
          <Link
            to="/forgot-password"
            className="border-b border-transparent font-medium text-[#0F1A2B] transition-colors hover:border-[#0F1A2B]"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[#0F1A2B] p-[0.85rem] text-sm font-semibold text-white transition-all hover:bg-[#16233A] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3DD9C4]"
        >
          {form.formState.isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin text-white" />
          ) : (
            <>
              Sign in
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-1">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3 text-xs text-[#6B7280] before:h-px before:flex-1 before:bg-[#E4E7EC] after:h-px after:flex-1 after:bg-[#E4E7EC]">
        or continue with
      </div>

      {/* SSO Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => toast('Google SSO integration coming soon')}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[#E4E7EC] bg-white p-[0.7rem] text-xs sm:text-sm font-medium text-[#12141C] transition-colors hover:border-[#C4C9D2] hover:bg-[#FCFCFD]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </button>
        <button
          type="button"
          onClick={() => toast('Microsoft SSO integration coming soon')}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[#E4E7EC] bg-white p-[0.7rem] text-xs sm:text-sm font-medium text-[#12141C] transition-colors hover:border-[#C4C9D2] hover:bg-[#FCFCFD]"
        >
          <svg width="16" height="16" viewBox="0 0 23 23"><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg>
          Microsoft
        </button>
      </div>
    </AuthShell>
  )
}

export function ForgotPasswordPage() {
  const form = useForm<{ email: string }>({
    resolver: zodResolver(z.object({ email: z.string().email('Enter a valid email') }))
  })

  const submit = form.handleSubmit(async values => {
    try {
      await api.post(ENDPOINTS.auth.forgotPassword, values)
      toast.success('If the account exists, reset instructions were issued.')
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not submit request'
      toast.error(msg)
    }
  })

  return (
    <AuthShell
      kicker="Account recovery"
      title="Reset your password"
      subtitle="Enter your work email address below to receive password reset instructions."
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-[#12141C]">
            Work email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@company.com"
            className="w-full rounded-[10px] border border-[#E4E7EC] bg-white px-[0.95rem] py-[0.8rem] text-sm text-[#12141C] outline-none transition placeholder:text-[#B4B8C2] focus:border-[#3DD9C4] focus:ring-4 focus:ring-[rgba(61,217,196,0.14)]"
            {...form.register('email')}
          />
          {form.formState.errors.email?.message && (
            <p className="mt-1 text-xs text-[#FF6B6B]">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[#0F1A2B] p-[0.85rem] text-sm font-semibold text-white transition-all hover:bg-[#16233A] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {form.formState.isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin text-white" />
          ) : (
            'Request reset'
          )}
        </button>

        <Link
          to="/login"
          className="block text-center text-xs sm:text-sm font-semibold text-[#0F1A2B] underline hover:opacity-80"
        >
          Back to sign in
        </Link>
      </form>
    </AuthShell>
  )
}

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const tokenFromUrl = params.get('token') ?? ''
  const [showPassword, setShowPassword] = useState(false)

  const schema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  })

  const form = useForm<z.infer<typeof schema>>({
    defaultValues: { token: tokenFromUrl, password: '', confirmPassword: '' },
    resolver: zodResolver(schema)
  })

  const submit = form.handleSubmit(async values => {
    try {
      await api.post(ENDPOINTS.auth.resetPassword, { token: values.token, password: values.password }).then(unwrap)
      toast.success('Password reset successfully. You can sign in now.')
      navigate('/login')
    } catch {
      toast.error('The reset token is invalid or expired.')
    }
  })

  return (
    <AuthShell
      kicker="Account recovery"
      title="Create a new password"
      subtitle="Define a secure new password for your PeopleOps account."
    >
      {!tokenFromUrl ? (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-800 space-y-2">
          <p className="font-semibold">Invalid or missing reset token.</p>
          <p>Please request a new password reset link from the forgot password page.</p>
          <Link to="/forgot-password" className="inline-block font-semibold text-red-900 underline hover:text-red-950">
            Request password reset
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <input type="hidden" {...form.register('token')} />
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-[#12141C]">
              New password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full rounded-[10px] border border-[#E4E7EC] bg-white py-[0.8rem] pl-[0.95rem] pr-[4.5rem] text-sm text-[#12141C] outline-none transition placeholder:text-[#B4B8C2] focus:border-[#3DD9C4] focus:ring-4 focus:ring-[rgba(61,217,196,0.14)]"
                {...form.register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6B7280] hover:text-[#12141C]"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {form.formState.errors.password?.message && (
              <p className="mt-1 text-xs text-[#FF6B6B]">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-medium text-[#12141C]">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full rounded-[10px] border border-[#E4E7EC] bg-white px-[0.95rem] py-[0.8rem] text-sm text-[#12141C] outline-none transition placeholder:text-[#B4B8C2] focus:border-[#3DD9C4] focus:ring-4 focus:ring-[rgba(61,217,196,0.14)]"
              {...form.register('confirmPassword')}
            />
            {form.formState.errors.confirmPassword?.message && (
              <p className="mt-1 text-xs text-[#FF6B6B]">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[#0F1A2B] p-[0.85rem] text-sm font-semibold text-white transition-all hover:bg-[#16233A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {form.formState.isSubmitting ? (
              <LoaderCircle className="size-4 animate-spin text-white" />
            ) : (
              'Reset password'
            )}
          </button>

          <Link
            to="/login"
            className="block text-center text-xs sm:text-sm font-semibold text-[#0F1A2B] underline hover:opacity-80"
          >
            Back to sign in
          </Link>
        </form>
      )}
    </AuthShell>
  )
}

export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-[#12141C]">
      <span className="mb-1.5 block">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-normal text-[#FF6B6B]">{error}</span>}
    </label>
  )
}

