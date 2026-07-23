import { useState, type ReactNode } from 'react'
import { BarChart3, Building2, Calendar, CalendarClock, ChevronLeft, ClipboardCheck, LayoutDashboard, LogOut, Menu, Settings, Users } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../store/auth-context'
import type { Role } from '../types/models'
import { cn } from '../components/ui'
import { initials, title } from '../utils/format'

const nav = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, roles: ['ADMIN', 'HR', 'MANAGER'] as Role[] },
  { to: '/employees', label: 'Employees', icon: Users, roles: ['ADMIN', 'HR', 'MANAGER'] as Role[] },
  { to: '/departments', label: 'Departments', icon: Building2, roles: ['ADMIN', 'HR'] as Role[] },
  { to: '/shifts', label: 'Shifts', icon: CalendarClock, roles: ['ADMIN', 'HR'] as Role[] },
  { to: '/attendance', label: 'Attendance', icon: ClipboardCheck, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] as Role[] },
  { to: '/leaves', label: 'Leave management', icon: BarChart3, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] as Role[] },
  { to: '/holidays', label: 'Calendar / Holidays', icon: Calendar, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] as Role[] },
  { to: '/team', label: 'My Team', icon: Users, roles: ['MANAGER', 'EMPLOYEE'] as Role[] },
  { to: '/profile', label: 'My profile', icon: Users, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] as Role[] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['ADMIN'] as Role[] }
] as const

export function AppLayout() {
  const { user, logout, hasRole } = useAuth(); const [open, setOpen] = useState(false); const location = useLocation()
  if (!user) return null
  const links = nav.filter(item => hasRole(...item.roles))
  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <aside className={cn('fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-6"><div className="grid size-8 place-items-center rounded-lg bg-blue-700 font-bold text-white">P</div><span className="font-bold tracking-tight">PeopleOps</span><button onClick={() => setOpen(false)} className="ml-auto lg:hidden"><ChevronLeft className="size-5" /></button></div>
      <nav className="flex-1 space-y-1 p-3">{links.map(({ to, label, icon: Icon }) => <NavLink end={to === '/'} key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition', isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}><Icon className="size-[18px]" />{label}</NavLink>)}</nav>
      <div className="m-3 rounded-xl bg-slate-50 p-3"><div className="flex items-center gap-2"><div className="grid size-9 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{initials(user.firstName, user.lastName)}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{user.firstName} {user.lastName}</p><p className="text-xs text-slate-500">{title(user.role)}</p></div></div><button onClick={() => void logout()} className="mt-3 flex w-full items-center gap-2 border-t border-slate-200 pt-3 text-xs font-medium text-slate-600 hover:text-red-700"><LogOut className="size-4" />Sign out</button></div>
    </aside>
    {open && <button aria-label="Close menu" className="fixed inset-0 z-20 bg-slate-900/30 lg:hidden" onClick={() => setOpen(false)} />}
    <main className="lg:pl-64"><header className="sticky top-0 z-10 flex h-16 items-center border-b border-slate-200 bg-white/90 px-5 backdrop-blur lg:px-8"><button onClick={() => setOpen(true)} className="lg:hidden"><Menu className="size-5" /></button><div className="ml-3 lg:ml-0"><p className="text-sm font-semibold">{nav.find(x => x.to === location.pathname)?.label ?? 'PeopleOps'}</p><p className="text-xs text-slate-500">Employee management workspace</p></div></header><div className="mx-auto max-w-7xl p-5 lg:p-8"><Outlet /></div></main>
  </div>
}
export function PageHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) { return <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight">{title}</h1><p className="mt-1 text-sm text-slate-500">{description}</p></div>{actions}</div> }
