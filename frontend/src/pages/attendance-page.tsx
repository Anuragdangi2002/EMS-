import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Clock, LogIn, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge, Button, Card, Empty } from '../components/ui'
import { DataTable } from '../components/data-table'
import { PageHeader } from '../layouts/app-layout'
import { attendanceService, employeeService } from '../services/ems.service'
import type { Attendance } from '../types/models'
import { date, time, title } from '../utils/format'
import { useAuth } from '../store/auth-context'

export function AttendancePage() {
  const { user, hasRole } = useAuth();
  const client = useQueryClient();
  const isManager = user?.role === 'MANAGER';
  const isAdminOrHr = hasRole('ADMIN', 'HR');

  const profile = useQuery({
    queryKey: ['employee', 'me'],
    queryFn: employeeService.me,
    enabled: !isAdminOrHr,
    retry: false
  });

  const myAttendance = useQuery({
    queryKey: ['attendance', 'my', profile.data?.id],
    queryFn: () => attendanceService.history(profile.data!.id),
    enabled: !!profile.data?.id
  });

  const teamAttendance = useQuery({
    queryKey: ['attendance', 'team'],
    queryFn: () => attendanceService.list(),
    enabled: isAdminOrHr || isManager
  });

  const checkIn = useMutation({
    mutationFn: attendanceService.checkIn,
    onSuccess: () => {
      toast.success('Checked in');
      void client.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: () => toast.error('Check-in could not be completed')
  });

  const checkOut = useMutation({
    mutationFn: attendanceService.checkOut,
    onSuccess: () => {
      toast.success('Checked out');
      void client.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: () => toast.error('Check-out could not be completed')
  });

  const todayStr = new Date().toDateString();
  const record = myAttendance.data?.find(x => new Date(x.date).toDateString() === todayStr);

  const myColumns: ColumnDef<Attendance>[] = useMemo(() => [
    { accessorKey: 'date', header: 'Date', cell: x => date(x.getValue<string>()) },
    { accessorKey: 'checkIn', header: 'Check in', cell: x => time(x.getValue<string | null>()) },
    { accessorKey: 'checkOut', header: 'Check out', cell: x => time(x.getValue<string | null>()) },
    { accessorKey: 'totalHours', header: 'Working hours', cell: x => x.getValue<number | null>()?.toFixed(2) ?? '—' },
    { accessorKey: 'overtimeHours', header: 'Overtime', cell: x => x.getValue<number | null>()?.toFixed(2) ?? '—' },
    { accessorKey: 'status', header: 'Status', cell: x => <Badge tone={x.getValue() === 'LATE' ? 'yellow' : 'green'}>{title(x.getValue<string>())}</Badge> }
  ], []);

  const teamColumns: ColumnDef<Attendance>[] = useMemo(() => [
    { accessorKey: 'date', header: 'Date', cell: x => date(x.getValue<string>()) },
    {
      id: 'employee',
      header: 'Employee',
      cell: (x: any) => x.row.original.employee ? `${x.row.original.employee.firstName} ${x.row.original.employee.lastName}` : x.row.original.employeeId
    },
    { accessorKey: 'checkIn', header: 'Check in', cell: x => time(x.getValue<string | null>()) },
    { accessorKey: 'checkOut', header: 'Check out', cell: x => time(x.getValue<string | null>()) },
    { accessorKey: 'totalHours', header: 'Working hours', cell: x => x.getValue<number | null>()?.toFixed(2) ?? '—' },
    { accessorKey: 'overtimeHours', header: 'Overtime', cell: x => x.getValue<number | null>()?.toFixed(2) ?? '—' },
    { accessorKey: 'status', header: 'Status', cell: x => <Badge tone={x.getValue() === 'LATE' ? 'yellow' : 'green'}>{title(x.getValue<string>())}</Badge> }
  ], []);

  const clockActions = !isAdminOrHr && profile.data ? (
    <div className="flex gap-2">
      <Button className="bg-emerald-600 hover:bg-emerald-700" loading={checkIn.isPending} disabled={!!record} onClick={() => checkIn.mutate(profile.data!.id)}>
        <LogIn className="size-4" />
        Check in
      </Button>
      <Button loading={checkOut.isPending} disabled={!record || !!record.checkOut} onClick={() => checkOut.mutate(profile.data!.id)}>
        <LogOut className="size-4" />
        Check out
      </Button>
    </div>
  ) : undefined;

  const noProfileWarning = !isAdminOrHr && profile.isError && (
    <Card className="mb-6">
      <div className="flex gap-3 text-sm text-amber-800 text-left">
        <Clock className="size-5 shrink-0" />
        No employee profile is linked to this account yet. Attendance actions need the employee profile API to succeed.
      </div>
    </Card>
  );

  if (isAdminOrHr) {
    return (
      <>
        <PageHeader title="Attendance" description="Daily attendance across the workforce." />
        <Card>
          {teamAttendance.isLoading ? (
            <Empty>Loading attendance…</Empty>
          ) : (
            <DataTable data={teamAttendance.data ?? []} columns={teamColumns} empty="No attendance entries are available." />
          )}
        </Card>
      </>
    );
  }

  if (isManager) {
    return (
      <>
        <PageHeader title="Attendance" description="Manage your team's attendance and log your own time." actions={clockActions} />
        {noProfileWarning}
        <div className="space-y-6">
          <Card title="My Attendance History">
            {myAttendance.isLoading ? (
              <Empty>Loading attendance…</Empty>
            ) : (
              <DataTable data={myAttendance.data ?? []} columns={myColumns} empty="No personal attendance entries found." />
            )}
          </Card>
          <Card title="Team Attendance (Subordinates)">
            {teamAttendance.isLoading ? (
              <Empty>Loading attendance…</Empty>
            ) : (
              <DataTable data={teamAttendance.data ?? []} columns={teamColumns} empty="No team attendance entries found today." />
            )}
          </Card>
        </div>
      </>
    );
  }

  // Regular Employee
  return (
    <>
      <PageHeader title="Attendance" description="Check in, check out, and review your time." actions={clockActions} />
      {noProfileWarning}
      <Card>
        {myAttendance.isLoading ? (
          <Empty>Loading attendance…</Empty>
        ) : (
          <DataTable data={myAttendance.data ?? []} columns={myColumns} empty="No attendance entries are available." />
        )}
      </Card>
    </>
  );
}
