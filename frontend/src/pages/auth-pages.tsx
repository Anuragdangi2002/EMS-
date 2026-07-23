import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api, unwrap } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { Button, Input } from '../components/ui'
import { useAuth } from '../store/auth-context'

const loginSchema = z.object({ email: z.string().email('Enter a valid email'), password: z.string().min(1, 'Password is required') })
const passwordSchema = z.string().min(8).regex(/[a-z]/, 'Include a lowercase letter').regex(/[A-Z]/, 'Include an uppercase letter').regex(/[0-9]/, 'Include a number').regex(/[^a-zA-Z0-9]/, 'Include a special character')
function AuthShell({ title, children }: { title: string; children: React.ReactNode }) { return <main className="grid min-h-screen lg:grid-cols-2"><section className="hidden bg-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between"><div className="flex items-center gap-3 font-bold"><span className="grid size-9 place-items-center rounded-lg bg-blue-600">P</span>PeopleOps</div><div><p className="text-4xl font-semibold leading-tight">Workforce operations, made calm and clear.</p><p className="mt-5 max-w-md text-slate-400">Attendance, leave, people, and organisational data in one focused workspace.</p></div><p className="text-sm text-slate-500">Enterprise employee management</p></section><section className="flex items-center justify-center bg-slate-50 p-5"><div className="w-full max-w-md"><div className="mb-8 lg:hidden font-bold">PeopleOps</div><h1 className="text-2xl font-bold">{title}</h1>{children}</div></section></main> }
export function LoginPage() { const { login } = useAuth(); const navigate = useNavigate(); const form = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) }); const submit = form.handleSubmit(async values => { try { const user = await login(values.email, values.password); toast.success('Welcome back'); navigate(user.role === 'EMPLOYEE' ? '/attendance' : '/') } catch { toast.error('Unable to sign in. Check your credentials.') } }); return <AuthShell title="Welcome back"><p className="mt-2 text-sm text-slate-500">Sign in to manage your workforce.</p><form onSubmit={submit} className="mt-8 space-y-4"><Field label="Email" error={form.formState.errors.email?.message}><Input type="email" autoComplete="email" {...form.register('email')} /></Field><Field label="Password" error={form.formState.errors.password?.message}><Input type="password" autoComplete="current-password" {...form.register('password')} /></Field><div className="text-right"><Link to="/forgot-password" className="text-sm font-medium text-blue-700">Forgot password?</Link></div><Button loading={form.formState.isSubmitting} className="w-full" type="submit">Sign in</Button></form></AuthShell> }
export function ForgotPasswordPage() {
  const form = useForm<{ email: string }>({
    resolver: zodResolver(z.object({ email: z.string().email('Enter a valid email') }))
  });
  const submit = form.handleSubmit(async values => {
    try {
      await api.post(ENDPOINTS.auth.forgotPassword, values);
      toast.success('If the account exists, reset instructions were issued.');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not submit request';
      toast.error(msg);
    }
  });
  return (
    <AuthShell title="Reset your password">
      <p className="mt-2 text-sm text-slate-500">
        Enter your work email address below to receive password reset instructions.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Work email" error={form.formState.errors.email?.message}>
          <Input type="email" {...form.register('email')} />
        </Field>
        <Button className="w-full" loading={form.formState.isSubmitting}>Request reset</Button>
        <Link className="block text-center text-sm text-blue-700 font-medium" to="/login">Back to sign in</Link>
      </form>
    </AuthShell>
  );
}

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = params.get('token') ?? '';

  const schema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

  const form = useForm<z.infer<typeof schema>>({
    defaultValues: { token: tokenFromUrl, password: '', confirmPassword: '' },
    resolver: zodResolver(schema)
  });

  const submit = form.handleSubmit(async values => {
    try {
      await api.post(ENDPOINTS.auth.resetPassword, { token: values.token, password: values.password }).then(unwrap);
      toast.success('Password reset successfully. You can sign in now.');
      navigate('/login');
    } catch {
      toast.error('The reset token is invalid or expired.');
    }
  });

  return (
    <AuthShell title="Create a new password">
      <p className="mt-2 text-sm text-slate-500 text-left mb-6">
        Define a secure new password for your PeopleOps account.
      </p>
      {!tokenFromUrl ? (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 text-left border border-red-100 space-y-2">
          <p className="font-semibold">Invalid or missing reset token.</p>
          <p>Please request a new password reset link from the forgot password page.</p>
          <Link to="/forgot-password" className="inline-block font-semibold text-red-900 underline hover:text-red-950">
            Request password reset
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4 text-left">
          <input type="hidden" {...form.register('token')} />
          <Field label="New password" error={form.formState.errors.password?.message}>
            <Input type="password" placeholder="••••••••" {...form.register('password')} />
          </Field>
          <Field label="Confirm new password" error={form.formState.errors.confirmPassword?.message}>
            <Input type="password" placeholder="••••••••" {...form.register('confirmPassword')} />
          </Field>
          <Button className="w-full" loading={form.formState.isSubmitting}>Reset password</Button>
          <Link className="block text-center text-sm text-blue-700 font-medium" to="/login">Back to sign in</Link>
        </form>
      )}
    </AuthShell>
  );
}
export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="block text-sm font-medium text-slate-700"><span className="mb-1.5 block">{label}</span>{children}{error && <span className="mt-1 block text-xs font-normal text-red-600">{error}</span>}</label> }
