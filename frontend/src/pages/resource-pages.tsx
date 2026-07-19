import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, Button, Input, Badge, Empty } from '../components/ui'
import { DataTable } from '../components/data-table'
import { PageHeader } from '../layouts/app-layout'
import { departmentService, shiftService } from '../services/ems.service'
import type { Department, Shift } from '../types/models'
import { useAuth } from '../store/auth-context'

type Item = Department | Shift
function Modal({ title, children, close }: { title: string; children: React.ReactNode; close: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl transition-all border border-slate-100 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-slate-950">{title}</h2>
          <button onClick={close} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition">
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 text-left">
          {children}
        </div>
      </div>
    </div>
  );
}

function ResourcePage<T extends Item>({
  kind,
  queryKey,
  list,
  create,
  update,
  remove,
  columns,
  fields
}: {
  kind: 'Department' | 'Shift';
  queryKey: string;
  list: () => Promise<T[]>;
  create: (body: Partial<T>) => Promise<T>;
  update: (id: string, body: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<null>;
  columns: ColumnDef<T>[];
  fields: Array<{ name: keyof T; label: string; type?: string; required?: boolean }>;
}) {
  const { hasRole } = useAuth();
  const client = useQueryClient();
  const [editing, setEditing] = useState<T | null | undefined>();
  const [search, setSearch] = useState('');
  const query = useQuery({ queryKey: [queryKey], queryFn: list });
  const canEdit = hasRole('ADMIN', 'HR');
  const mutate = useMutation({
    mutationFn: (data: { id?: string; body: Partial<T> }) => data.id ? update(data.id, data.body) : create(data.body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: [queryKey] });
      setEditing(undefined);
      toast.success(`${kind} saved`);
    },
    onError: () => toast.error(`Unable to save ${kind.toLowerCase()}`)
  });
  const destroy = useMutation({
    mutationFn: remove,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: [queryKey] });
      toast.success(`${kind} removed`);
    },
    onError: () => toast.error(`Unable to remove ${kind.toLowerCase()}`)
  });
  const rows = useMemo(() => (query.data ?? []).filter(x => Object.values(x).some(v => String(v ?? '').toLowerCase().includes(search.toLowerCase()))), [query.data, search]);
  const actionColumns: ColumnDef<T>[] = canEdit ? [
    ...columns,
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700" onClick={() => setEditing(row.original)}><Pencil className="size-4" /></button>
          <button className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-700" onClick={() => { if (confirm(`Remove this ${kind.toLowerCase()}?`)) destroy.mutate(row.original.id); }}><Trash2 className="size-4" /></button>
        </div>
      )
    }
  ] : columns;

  return (
    <>
      <PageHeader
        title={`${kind}s`}
        description={`Maintain the organisation’s active ${kind.toLowerCase()} records.`}
        actions={canEdit ? <Button onClick={() => setEditing(null)}><Plus className="size-4" />Add {kind}</Button> : undefined}
      />
      <Card>
        <div className="mb-4 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-3 size-4 text-slate-400" />
            <Input className="pl-9" placeholder={`Search ${kind.toLowerCase()}s`} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {query.isLoading ? <Empty>Loading…</Empty> : <DataTable data={rows} columns={actionColumns} />}
      </Card>
      {editing !== undefined && (
        <ResourceForm
          kind={kind}
          fields={fields}
          value={editing ?? undefined}
          close={() => setEditing(undefined)}
          save={body => mutate.mutate({ id: editing?.id, body })}
          loading={mutate.isPending}
        />
      )}
    </>
  );
}

function ResourceForm<T extends Item>({
  kind,
  fields,
  value,
  close,
  save,
  loading
}: {
  kind: string;
  fields: Array<{ name: keyof T; label: string; type?: string; required?: boolean }>;
  value?: T;
  close: () => void;
  save: (body: Partial<T>) => void;
  loading: boolean;
}) {
  const [body, setBody] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(fields.map(x => [x.name, value?.[x.name] ?? (x.name === 'gracePeriod' ? 15 : '')]))
  );

  return (
    <Modal title={`${value ? 'Edit' : 'Add'} ${kind}`} close={close}>
      <form className="space-y-4 p-5" onSubmit={e => { e.preventDefault(); save(body as Partial<T>); }}>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(field => (
            <label key={String(field.name)} className="text-sm font-medium text-slate-700 block text-left">
              {field.label}
              <Input
                required={field.required}
                type={field.type ?? 'text'}
                value={String(body[String(field.name)] ?? '')}
                onChange={e => setBody({ ...body, [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                className="mt-1.5"
              />
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={close}>Cancel</Button>
          <Button loading={loading}>Save {kind}</Button>
        </div>
      </form>
    </Modal>
  );
}
export function DepartmentsPage() { const columns: ColumnDef<Department>[] = [{ accessorKey: 'name', header: 'Department' }, { accessorKey: 'code', header: 'Code' }, { accessorKey: 'description', header: 'Description', cell: x => x.getValue<string | null>() || '—' }, { accessorKey: 'isActive', header: 'Status', cell: x => <Badge tone={x.getValue() ? 'green' : 'gray'}>{x.getValue() ? 'Active' : 'Inactive'}</Badge> }]; return <ResourcePage kind="Department" queryKey="departments" list={departmentService.list} create={departmentService.create} update={departmentService.update} remove={departmentService.remove} columns={columns} fields={[{ name: 'name', label: 'Name', required: true }, { name: 'code', label: 'Code', required: true }, { name: 'description', label: 'Description' }]} /> }
export function ShiftsPage() { const columns: ColumnDef<Shift>[] = [{ accessorKey: 'name', header: 'Shift' }, { accessorKey: 'startTime', header: 'Start' }, { accessorKey: 'endTime', header: 'End' }, { accessorKey: 'gracePeriod', header: 'Grace', cell: x => `${x.getValue()} min` }, { accessorKey: 'isActive', header: 'Status', cell: x => <Badge tone={x.getValue() ? 'green' : 'gray'}>{x.getValue() ? 'Active' : 'Inactive'}</Badge> }]; return <ResourcePage kind="Shift" queryKey="shifts" list={shiftService.list} create={shiftService.create} update={shiftService.update} remove={shiftService.remove} columns={columns} fields={[{ name: 'name', label: 'Name', required: true }, { name: 'startTime', label: 'Start time', type: 'time', required: true }, { name: 'endTime', label: 'End time', type: 'time', required: true }, { name: 'gracePeriod', label: 'Grace period (minutes)', type: 'number' }]} /> }
