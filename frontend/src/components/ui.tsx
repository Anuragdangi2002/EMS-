import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'

export const cn = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(' ')
export function Button({
  className,
  variant = 'primary',
  loading,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  loading?: boolean
}) {
  const baseStyle = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';
  const variants = {
    primary: 'bg-blue-700 text-white hover:bg-blue-800',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    danger: 'bg-red-700 text-white hover:bg-red-800'
  };
  return (
    <button
      className={cn(baseStyle, variants[variant], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={cn('w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-3 focus:ring-blue-100', className)} {...props} /> }
export function Card({ title, actions, children, className }: { title?: string; actions?: ReactNode; children: ReactNode; className?: string }) { return <section className={cn('rounded-xl border border-slate-200 bg-white shadow-sm', className)}>{(title || actions) && <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">{title}</h2>{actions}</div>}<div className="p-5">{children}</div></section> }
export function Badge({ children, tone = 'gray' }: { children: ReactNode; tone?: 'gray' | 'green' | 'yellow' | 'red' | 'blue' }) { const tones = { gray: 'bg-slate-100 text-slate-700', green: 'bg-emerald-100 text-emerald-700', yellow: 'bg-amber-100 text-amber-800', red: 'bg-red-100 text-red-700', blue: 'bg-blue-100 text-blue-700' }; return <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', tones[tone])}>{children}</span> }
export function Empty({ children }: { children: ReactNode }) { return <div className="py-12 text-center text-sm text-slate-500">{children}</div> }
