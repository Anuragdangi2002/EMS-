import { useQuery } from '@tanstack/react-query'
import { Building2, CalendarClock, Clock3, UserCheck, Users } from 'lucide-react'
import { Card, Empty } from '../components/ui'
import { PageHeader } from '../layouts/app-layout'
import { dashboardService } from '../services/ems.service'

const stats = [{ key: 'activeEmployees', label: 'Active employees', icon: Users, tone: 'bg-blue-50 text-blue-700' }, { key: 'presentToday', label: 'Present today', icon: UserCheck, tone: 'bg-emerald-50 text-emerald-700' }, { key: 'departments', label: 'Departments', icon: Building2, tone: 'bg-violet-50 text-violet-700' }, { key: 'shifts', label: 'Active shifts', icon: CalendarClock, tone: 'bg-amber-50 text-amber-700' }] as const
export function DashboardPage() {
  const dashboard = useQuery({ queryKey: ['dashboard'], queryFn: dashboardService.get });
  const data = dashboard.data;

  return (
    <>
      <PageHeader title="Workforce overview" description="A real-time view of the organisation today." />
      {dashboard.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(x => <div key={x.key} className="h-32 animate-pulse rounded-xl bg-slate-200" />)}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ key, label, icon: Icon, tone }) => (
              <Card key={key}>
                <div className="flex items-start justify-between text-left">
                  <div>
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-bold">{data[key]}</p>
                  </div>
                  <span className={`grid size-10 place-items-center rounded-lg ${tone}`}>
                    <Icon className="size-5" />
                  </span>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <Card title="Today’s attendance" className="lg:col-span-3 text-left">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  ['Present', data.presentToday, 'text-emerald-600'],
                  ['Late', data.lateToday, 'text-amber-600'],
                  ['Absent', data.absentToday, 'text-red-600'],
                  ['On leave', data.employeesOnLeave, 'text-blue-600']
                ].map(([label, value, color]) => (
                  <div key={String(label)} className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${data.activeEmployees ? (data.presentToday / data.activeEmployees) * 100 : 0}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">Present rate calculated from the active workforce.</p>
            </Card>
            <Card title="Quick context" className="lg:col-span-2 text-left">
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <Clock3 className="size-5 text-blue-700" />
                  <span>{data.totalEmployees} total employee records</span>
                </div>
                <DashboardCharts />
              </div>
            </Card>
          </div>
        </>
      ) : (
        <Empty>Dashboard data is unavailable.</Empty>
      )}
    </>
  );
}

function DashboardCharts() {
  return (
    <div className="space-y-5 mt-2">
      {/* Line Chart: Attendance Trend */}
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm text-left">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Attendance Rate Trend</h4>
        <div className="relative h-24 w-full">
          <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.00" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#3b82f6" floodOpacity="0.3" />
              </filter>
            </defs>
            {/* Grid Lines */}
            <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeWidth="0.5" />
            <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="0.5" />
            <line x1="0" y1="80" x2="300" y2="80" stroke="#f1f5f9" strokeWidth="0.5" />
            {/* Gradient Fill Area */}
            <path
              d="M 10 90 Q 75 30 150 45 T 290 20 L 290 90 Z"
              fill="url(#chartGrad)"
            />
            {/* Stroke Line */}
            <path
              d="M 10 90 Q 75 30 150 45 T 290 20"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              filter="url(#glow)"
              strokeLinecap="round"
            />
            {/* Dots */}
            <circle cx="10" cy="90" r="3.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="80" cy="40" r="3.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="150" cy="45" r="3.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="220" cy="30" r="3.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="290" cy="20" r="3.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-2 px-1">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
        </div>
      </div>

      {/* Bar Chart: Daily Avg Working Hours */}
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm text-left">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Average Productive Hours</h4>
        <div className="relative h-24 w-full flex items-end justify-between px-2 pt-2">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div className="border-b border-slate-50 w-full h-0"></div>
            <div className="border-b border-slate-50 w-full h-0"></div>
            <div className="border-b border-slate-50 w-full h-0"></div>
          </div>
          {/* Bars */}
          {[
            { label: 'Mon', hrs: '7.8h', val: 78, fill: 'from-blue-500 to-indigo-500' },
            { label: 'Tue', hrs: '8.2h', val: 82, fill: 'from-blue-500 to-indigo-500' },
            { label: 'Wed', hrs: '8.5h', val: 85, fill: 'from-emerald-500 to-teal-500' },
            { label: 'Thu', hrs: '8.0h', val: 80, fill: 'from-blue-500 to-indigo-500' },
            { label: 'Fri', hrs: '7.2h', val: 72, fill: 'from-blue-500 to-indigo-500' },
          ].map((bar, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1 group z-10">
              <span className="text-[9px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity mb-1 bg-slate-800 text-white rounded px-1 py-0.5 pointer-events-none absolute -translate-y-6">
                {bar.hrs}
              </span>
              <div className="w-5 bg-slate-100 rounded-t-md h-16 flex items-end overflow-hidden">
                <div
                  className={`w-full rounded-t-md bg-gradient-to-t ${bar.fill} transition-all duration-500 group-hover:brightness-110`}
                  style={{ height: `${bar.val}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-slate-400 mt-2">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
