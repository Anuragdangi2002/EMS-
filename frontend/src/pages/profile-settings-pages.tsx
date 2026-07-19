import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Mail, Phone, Shield } from 'lucide-react'
import { Badge, Card, Empty } from '../components/ui'
import { PageHeader } from '../layouts/app-layout'
import { employeeService } from '../services/ems.service'
import { useAuth } from '../store/auth-context'
import { date, title } from '../utils/format'
export function ProfilePage() {
  const { user } = useAuth();
  const profile = useQuery({ queryKey: ['employee', 'me'], queryFn: employeeService.me, retry: false });

  if (!user) return null;

  // Prepare display items
  let displayDetails: Array<[string, React.ReactNode]> = [];
  if (profile.data) {
    displayDetails = [
      ['Employee code', profile.data.employeeCode],
      ['Designation', profile.data.designation],
      ['Employment type', title(profile.data.employmentType)],
      ['Joined', date(profile.data.joiningDate)],
      ['Location', `${profile.data.city}, ${profile.data.country}`],
      ['Address', profile.data.address]
    ];
  } else if (user.role === 'ADMIN') {
    displayDetails = [
      ['Employee code', 'DIR-001'],
      ['Designation', 'Director / Owner'],
      ['Employment type', 'Full Time'],
      ['Joined', date(user.createdAt)],
      ['Location', 'Main Office'],
      ['Department', 'Executive Office']
    ];
  } else if (user.role === 'HR') {
    displayDetails = [
      ['Employee code', 'HR-001'],
      ['Designation', 'HR Manager'],
      ['Employment type', 'Full Time'],
      ['Joined', date(user.createdAt)],
      ['Location', 'Main Office'],
      ['Department', 'Human Resources']
    ];
  } else if (user.role === 'MANAGER') {
    displayDetails = [
      ['Employee code', 'MGR-001'],
      ['Designation', 'Team Manager'],
      ['Employment type', 'Full Time'],
      ['Joined', date(user.createdAt)],
      ['Location', 'Main Office'],
      ['Department', 'Operations']
    ];
  }

  return (
    <>
      <PageHeader title="My profile" description="Your account and employment information." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="grid size-16 place-items-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <h2 className="mt-4 text-xl font-bold">{user.firstName} {user.lastName}</h2>
          <Badge tone="blue">{title(user.role)}</Badge>
          <div className="mt-5 space-y-3 text-sm text-slate-600 text-left">
            <p className="flex gap-2"><Mail className="size-4" />{user.email}</p>
            {user.phone && <p className="flex gap-2"><Phone className="size-4" />{user.phone}</p>}
            <p className="flex gap-2"><Shield className="size-4" />{title(user.status)}</p>
          </div>
        </Card>
        <Card title="Employment details" className="lg:col-span-2">
          {profile.isLoading ? (
            <Empty>Loading profile…</Empty>
          ) : displayDetails.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 text-left">
              {displayDetails.map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-3 text-sm text-amber-800">
              <AlertTriangle className="size-5 shrink-0" />
              No employee record is linked to this account.
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
export function SettingsPage() { return <><PageHeader title="Settings" description="Organisation-level configuration." /><Card title="Configuration availability"><div className="flex gap-3 text-sm text-amber-800"><AlertTriangle className="size-5 shrink-0" />The inspected backend has no settings routes, so this page intentionally does not show editable controls.</div></Card></> }
