import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Check, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge, Button, Card, Empty, Input } from '../components/ui'
import { DataTable } from '../components/data-table'
import { PageHeader } from '../layouts/app-layout'
import { employeeService, leaveService } from '../services/ems.service'
import type { Leave } from '../types/models'
import { date, title } from '../utils/format'
import { useAuth } from '../store/auth-context'

function ApplyLeave({ close }: { close: () => void }) {
  const client = useQueryClient();
  const profile = useQuery({ queryKey: ['employee', 'me'], queryFn: employeeService.me });
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
  const apply = useMutation({
    mutationFn: () => leaveService.apply({ employeeId: profile.data!.id, ...form }),
    onSuccess: () => {
      toast.success('Leave request submitted');
      void client.invalidateQueries({ queryKey: ['leaves'] });
      close();
    },
    onError: () => toast.error('Leave request could not be submitted')
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm overflow-y-auto">
      <form
        onSubmit={e => { e.preventDefault(); apply.mutate() }}
        className="relative w-full max-w-md rounded-xl bg-white shadow-2xl transition-all border border-slate-100 max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-slate-950">Apply for leave</h2>
          <button type="button" onClick={close} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition">
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-4 p-5 overflow-y-auto flex-1">
          <label className="block text-sm font-medium text-slate-700">
            Start date
            <Input required type="date" className="mt-1.5" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            End date
            <Input required type="date" min={form.startDate} className="mt-1.5" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Reason
            <textarea
              required
              minLength={5}
              maxLength={255}
              className="mt-1.5 min-h-28 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none transition focus:border-blue-600 focus:ring-3 focus:ring-blue-100"
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
            />
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t p-5 bg-slate-50 rounded-b-xl">
          <Button type="button" variant="outline" onClick={close}>Cancel</Button>
          <Button loading={apply.isPending} disabled={!profile.data}>Submit request</Button>
        </div>
      </form>
    </div>
  );
}

export function LeavesPage() {
  const { hasRole } = useAuth();
  const client = useQueryClient();
  const [applyOpen, setApplyOpen] = useState(false);
  const profile = useQuery({
    queryKey: ['employee', 'me'],
    queryFn: employeeService.me,
    enabled: !hasRole('ADMIN', 'HR'),
    retry: false
  });
  const leaves = useQuery({
    queryKey: ['leaves'],
    queryFn: leaveService.list
  });
  const status = useMutation({
    mutationFn: ({ id, state }: { id: string; state: 'APPROVED' | 'REJECTED' }) =>
      leaveService.status(id, state),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['leaves'] });
      void client.invalidateQueries({ queryKey: ['employee', 'me'] });
      toast.success('Leave status updated');
    },
    onError: () => toast.error('Unable to update leave status')
  });
  const columns: ColumnDef<Leave>[] = [
    {
      id: 'employee',
      header: 'Employee',
      cell: x => {
        const emp = x.row.original.employee;
        if (!emp) return x.row.original.employeeId;
        const name = `${emp.firstName} ${emp.lastName}`;
        return (
          <div className="text-left">
            <span className="font-semibold text-slate-800">{name}</span>
            {hasRole('ADMIN', 'HR') && (
              <span className="text-xs text-slate-500 block font-medium">
                Balance: {emp.leaveBalance ?? 20} / {emp.allocatedLeaves ?? 20} days
              </span>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: 'startDate',
      header: 'From',
      cell: x => date(x.getValue<string>())
    },
    {
      accessorKey: 'endDate',
      header: 'To',
      cell: x => date(x.getValue<string>())
    },
    {
      accessorKey: 'reason',
      header: 'Reason'
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: x => <Badge tone={x.getValue() === 'APPROVED' ? 'green' : x.getValue() === 'REJECTED' ? 'red' : 'yellow'}>{title(x.getValue<string>())}</Badge>
    },
    {
      id: 'actions',
      header: '',
      cell: x => (hasRole('ADMIN', 'HR', 'MANAGER') && x.row.original.status === 'PENDING' && (!profile.data || x.row.original.employeeId !== profile.data.id)) ? (
        <div className="flex gap-1">
          <button onClick={() => status.mutate({ id: x.row.original.id, state: 'APPROVED' })} className="rounded p-1.5 text-emerald-700 hover:bg-emerald-50"><Check className="size-4" /></button>
          <button onClick={() => status.mutate({ id: x.row.original.id, state: 'REJECTED' })} className="rounded p-1.5 text-red-700 hover:bg-red-50"><X className="size-4" /></button>
        </div>
      ) : null
    }
  ];

  return (
    <>
      <PageHeader
        title="Leave management"
        description={hasRole('ADMIN', 'HR') ? 'Review and process employee leave requests.' : hasRole('MANAGER') ? 'Review subordinate requests or submit your own.' : 'Submit time-off requests.'}
        actions={!hasRole('ADMIN', 'HR') ? <Button onClick={() => setApplyOpen(true)}><Plus className="size-4" />Apply for leave</Button> : undefined}
      />
      {!hasRole('ADMIN', 'HR') && profile.data && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="bg-blue-50/50 border border-blue-100 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Allocated Leaves</p>
            <p className="mt-2 text-2xl font-bold text-blue-900">{profile.data.allocatedLeaves ?? 20} days</p>
          </Card>
          <Card className="bg-emerald-50/50 border border-emerald-100 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Remaining Balance</p>
            <p className="mt-2 text-2xl font-bold text-emerald-900">{profile.data.leaveBalance ?? 20} days</p>
          </Card>
          <Card className="bg-slate-50/50 border border-slate-100 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Used Leaves</p>
            <p className="mt-2 text-2xl font-bold text-slate-800">{((profile.data.allocatedLeaves ?? 20) - (profile.data.leaveBalance ?? 20)).toFixed(1)} days</p>
          </Card>
        </div>
      )}
      <Card title={hasRole('ADMIN', 'HR', 'MANAGER') ? undefined : "Your leave requests"}>
        {leaves.isLoading ? (
          <Empty>Loading leave requests…</Empty>
        ) : (
          <DataTable data={leaves.data ?? []} columns={columns} />
        )}
      </Card>
      {applyOpen && <ApplyLeave close={() => setApplyOpen(false)} />}
    </>
  );
}
