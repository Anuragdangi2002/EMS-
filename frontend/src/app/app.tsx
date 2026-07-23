import { Navigate, Route, Routes } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { useAuth } from '../store/auth-context'
import type { Role } from '../types/models'
import { AppLayout } from '../layouts/app-layout'
import { LoginPage, ForgotPasswordPage, ResetPasswordPage } from '../pages/auth-pages'
import { DashboardPage } from '../pages/dashboard-page'
import { EmployeesPage } from '../pages/employees-page'
import { DepartmentsPage, ShiftsPage } from '../pages/resource-pages'
import { AttendancePage } from '../pages/attendance-page'
import { LeavesPage } from '../pages/leaves-page'
import { ProfilePage, SettingsPage } from '../pages/profile-settings-pages'
import { HolidaysPage } from '../pages/holidays-page'
import { TeamPage } from '../pages/team-page'

function Loading() { return <div className="grid min-h-screen place-items-center text-blue-700"><LoaderCircle className="size-7 animate-spin" /></div> }
function Protected() { const { user, loading } = useAuth(); if (loading) return <Loading />; return user ? <AppLayout /> : <Navigate to="/login" replace /> }
function RequireRole({ roles, children }: { roles: Role[]; children: React.ReactNode }) { const { hasRole } = useAuth(); return hasRole(...roles) ? children : <Navigate to="/forbidden" replace /> }
function Public({ children }: { children: React.ReactNode }) { const { user, loading } = useAuth(); if (loading) return <Loading />; return user ? <Navigate to={user.role === 'EMPLOYEE' ? '/attendance' : '/'} replace /> : children }
function Forbidden() { return <div className="grid min-h-screen place-items-center bg-slate-50 p-5 text-center"><div><p className="text-6xl font-bold text-slate-200">403</p><h1 className="mt-4 text-xl font-bold">Access restricted</h1><p className="mt-2 text-sm text-slate-500">Your role does not have access to this area.</p></div></div> }
function NotFound() { return <div className="grid min-h-screen place-items-center bg-slate-50 text-center"><div><p className="text-6xl font-bold text-slate-200">404</p><h1 className="mt-4 text-xl font-bold">Page not found</h1></div></div> }
function Home() {
  const { user } = useAuth()
  if (user?.role === 'EMPLOYEE') {
    return <Navigate to="/attendance" replace />
  }
  return <DashboardPage />
}
export function App() { return <Routes><Route path="/login" element={<Public><LoginPage /></Public>} /><Route path="/forgot-password" element={<Public><ForgotPasswordPage /></Public>} /><Route path="/reset-password" element={<Public><ResetPasswordPage /></Public>} /><Route element={<Protected />}><Route index element={<Home />} /><Route path="dashboard" element={<Navigate to="/" replace />} /><Route path="employees" element={<RequireRole roles={['ADMIN', 'HR', 'MANAGER']}><EmployeesPage /></RequireRole>} /><Route path="departments" element={<RequireRole roles={['ADMIN', 'HR']}><DepartmentsPage /></RequireRole>} /><Route path="shifts" element={<RequireRole roles={['ADMIN', 'HR']}><ShiftsPage /></RequireRole>} /><Route path="attendance" element={<AttendancePage />} /><Route path="leaves" element={<LeavesPage />} /><Route path="holidays" element={<HolidaysPage />} /><Route path="team" element={<RequireRole roles={['MANAGER', 'EMPLOYEE']}><TeamPage /></RequireRole>} /><Route path="profile" element={<ProfilePage />} /><Route path="settings" element={<RequireRole roles={['ADMIN']}><SettingsPage /></RequireRole>} /><Route path="forbidden" element={<Forbidden />} /><Route path="*" element={<NotFound />} /></Route></Routes> }
