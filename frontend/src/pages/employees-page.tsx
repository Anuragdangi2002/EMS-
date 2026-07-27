import { useMemo, useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, LoaderCircle, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { api, type ApiEnvelope } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { Button, Card, Input, Badge, Empty } from '../components/ui'
import { DataTable } from '../components/data-table'
import { PageHeader } from '../layouts/app-layout'
import { departmentService, employeeService } from '../services/ems.service'
import type { Employee, User } from '../types/models'
import { date, title } from '../utils/format'
import { useAuth } from '../store/auth-context'

const required = (field: string) => z.string().trim().min(1, `${field} is required`)
const name = (field: string) => required(field).regex(/^[\p{L}\s'-]+$/u, `${field} cannot contain numbers or symbols`)
const today = () => new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
const asLocalDate = (value: string) => new Date(`${value}T00:00:00`)
const ageIsAtLeast18 = (value: string) => {
  const cutoff = today()
  cutoff.setFullYear(cutoff.getFullYear() - 18)
  return asLocalDate(value) <= cutoff
}

const employeeSchema = z.object({
  employeeCode: required('Employee code'),
  firstName: name('First name'),
  lastName: name('Last name'),
  email: z.string().email('Enter a valid email address').trim().optional().or(z.literal('')),
  password: z.string().optional().or(z.literal('')),
  phone: required('Phone').regex(/^\+?[0-9][0-9\s()-]{6,19}$/, 'Enter a valid phone number'),
  department: required('Department'),
  designation: required('Designation'),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERN', 'CONTRACT']),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  joiningDate: required('Joining date').refine(value => !Number.isNaN(asLocalDate(value).getTime()) && asLocalDate(value) <= today(), 'Joining date cannot be in the future'),
  dateOfBirth: required('Date of birth')
    .refine(value => !Number.isNaN(asLocalDate(value).getTime()) && asLocalDate(value) < today(), 'Date of birth cannot be today or in the future')
    .refine(ageIsAtLeast18, 'Employee must be at least 18 years old'),
  address: required('Address'),
  city: required('City'),
  state: required('State'),
  country: required('Country'),
  postalCode: required('Postal code').regex(/^[A-Za-z0-9][A-Za-z0-9 -]{2,11}$/, 'Enter a valid postal code'),
  managerId: z.string().optional().nullable(),
  role: z.enum(['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN']),
  allocatedLeaves: z.string().optional().or(z.literal('')),
  leaveBalance: z.string().optional().or(z.literal(''))
})

type EmployeeForm = z.infer<typeof employeeSchema>
type EmployeeWithContact = Employee & { email?: string; phone?: string | null; user?: Pick<User, 'email' | 'phone' | 'role'> }

const defaults: EmployeeForm = { employeeCode: '', firstName: '', lastName: '', email: '', password: '', phone: '', dateOfBirth: '', gender: 'OTHER', joiningDate: new Date().toISOString().slice(0, 10), employmentType: 'FULL_TIME', designation: '', department: '', address: '', city: '', state: '', country: '', postalCode: '', managerId: '', role: 'EMPLOYEE', allocatedLeaves: '20', leaveBalance: '20' }

function messageFrom(error: unknown, fallback: string) {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message
  return typeof message === 'string' && message.trim() ? message : fallback
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700"><span>{label}</span>{children}{error && <span className="mt-1 block text-xs font-normal text-red-600">{error}</span>}</label>
}

function EmployeeModal({ employee, close }: { employee?: EmployeeWithContact; close: () => void }) {
  const client = useQueryClient()
  const [profileImageUrl, setProfileImageUrl] = useState<string>()
  const [imageError, setImageError] = useState<string>()
  const depts = useQuery({ queryKey: ['departments'], queryFn: departmentService.list })
  const employeesQuery = useQuery({ queryKey: ['employees'], queryFn: employeeService.list })

  const isEdit = !!employee

  const initialValues = useMemo(() => {
    if (employee) {
      return {
        employeeCode: employee.employeeCode,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email ?? employee.user?.email ?? '',
        password: '',
        phone: employee.phone ?? employee.user?.phone ?? '',
        department: employee.departmentId,
        designation: employee.designation,
        employmentType: employee.employmentType,
        gender: employee.gender,
        joiningDate: employee.joiningDate.slice(0, 10),
        dateOfBirth: employee.dateOfBirth.slice(0, 10),
        address: employee.address,
        city: employee.city,
        state: employee.state,
        country: employee.country,
        postalCode: employee.postalCode,
        managerId: employee.managerId ?? '',
        role: employee.user?.role === 'DIRECTOR' ? 'ADMIN' : (employee.user?.role ?? 'EMPLOYEE'),
        allocatedLeaves: String(employee.allocatedLeaves ?? 20),
        leaveBalance: String(employee.leaveBalance ?? 20)
      }
    }
    return defaults
  }, [employee])

  const form = useForm<EmployeeForm>({ resolver: zodResolver(employeeSchema), defaultValues: initialValues })

  const saving = useMutation({
    mutationFn: async (values: EmployeeForm) => {
      const targetRole = values.role === 'ADMIN' ? 'DIRECTOR' : values.role
      const { email: _email, password: _password, ...employeeData } = values
      const leaveFields = {
        allocatedLeaves: values.allocatedLeaves ? parseFloat(values.allocatedLeaves) : 20,
        leaveBalance: values.leaveBalance ? parseFloat(values.leaveBalance) : 20
      }
      if (isEdit) {
        const res = await employeeService.update(employee.id, {
          ...employeeData,
          ...leaveFields,
          role: targetRole,
          managerId: employeeData.managerId || null,
          profileImageUrl
        })
        return { employee: res, message: 'Employee updated successfully' }
      } else {
        if (!values.email) {
          throw new Error('Work email is required for new accounts')
        }
        if (!values.password || values.password.length < 8) {
          throw new Error('Temporary password must be at least 8 characters')
        }
        const accountResponse = await api.post<ApiEnvelope<{ user: User }>>(ENDPOINTS.auth.register, { email: values.email, password: values.password, firstName: values.firstName, lastName: values.lastName, phone: values.phone, role: targetRole })
        const { role: _r, ...pureEmployeeData } = employeeData
        const employeeResponse = await api.post<ApiEnvelope<{ employee: Employee }>>(ENDPOINTS.employees, {
          ...pureEmployeeData,
          ...leaveFields,
          role: targetRole,
          userId: accountResponse.data.data.user.id,
          managerId: employeeData.managerId || null,
          profileImageUrl
        })
        return { employee: employeeResponse.data.data.employee, message: employeeResponse.data.message }
      }
    },
    onSuccess: async ({ employee: _emp, message }) => {
      close()
      await client.invalidateQueries({ queryKey: ['employees'] })
      toast.success(message)
    },
    onError: error => toast.error(messageFrom(error, isEdit ? 'Unable to update employee' : 'Unable to create employee'))
  })

  const possibleManagers = useMemo(() => {
    const list = employeesQuery.data ?? []
    if (isEdit) {
      return list.filter(item => item.id !== employee.id)
    }
    return list
  }, [employeesQuery.data, isEdit, employee])

  const selectClass = 'mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100'
  const pickImage = (file?: File) => {
    setImageError(undefined)
    if (!file) { setProfileImageUrl(undefined); return }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setProfileImageUrl(undefined)
      const err = 'Use a JPG, JPEG, PNG, or WEBP image'
      setImageError(err)
      toast.error(err)
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileImageUrl(undefined)
      const err = 'Profile image must be 2 MB or smaller'
      setImageError(err)
      toast.error(err)
      return
    }
    const reader = new FileReader()
    reader.onload = () => setProfileImageUrl(typeof reader.result === 'string' ? reader.result : undefined)
    reader.onerror = () => {
      setProfileImageUrl(undefined)
      const err = 'Unable to read the selected image'
      setImageError(err)
      toast.error(err)
    }
    reader.readAsDataURL(file)
  }
  const field = (name: keyof EmployeeForm, label: string, type = 'text') => <FormField label={label} error={form.formState.errors[name]?.message}><Input className="mt-1.5" type={type} disabled={saving.isPending} {...form.register(name)} /></FormField>

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm overflow-y-auto">
      <form onSubmit={form.handleSubmit(values => saving.mutate(values))} className="relative w-full max-w-4xl rounded-xl bg-white shadow-2xl transition-all border border-slate-100 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-semibold text-slate-955">{isEdit ? 'Edit employee' : 'Add employee'}</h2>
            <p className="text-xs text-slate-500">{isEdit ? 'Update employee profile details.' : 'Creates an employee login first, then their employee profile.'}</p>
          </div>
          <button type="button" onClick={close} disabled={saving.isPending} aria-label="Close" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition">
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-6 p-6 overflow-y-auto flex-1 text-left">
          {!isEdit && (
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Account</p>
              <div className="grid gap-4 sm:grid-cols-2">{field('email', 'Work email', 'email')}{field('password', 'Temporary password', 'password')}</div>
            </div>
          )}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Employment</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {field('employeeCode', 'Employee code')}
              {field('firstName', 'First name')}
              {field('lastName', 'Last name')}
              {field('phone', 'Phone')}
              {field('joiningDate', 'Joining date', 'date')}
              {field('dateOfBirth', 'Date of birth', 'date')}
              <FormField label="Gender" error={form.formState.errors.gender?.message}>
                <select className={selectClass} disabled={saving.isPending} {...form.register('gender')}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </FormField>
              <FormField label="Employment type" error={form.formState.errors.employmentType?.message}>
                <select className={selectClass} disabled={saving.isPending} {...form.register('employmentType')}>
                  {['FULL_TIME', 'PART_TIME', 'INTERN', 'CONTRACT'].map(value => <option key={value} value={value}>{title(value)}</option>)}
                </select>
              </FormField>
              {field('designation', 'Designation')}
              <FormField label="Department" error={form.formState.errors.department?.message}>
                <select className={selectClass} disabled={saving.isPending} {...form.register('department')}>
                  <option value="">Select department</option>
                  {depts.data?.map(department => <option key={department.id} value={department.id}>{department.name}</option>)}
                </select>
              </FormField>
              <FormField label="Manager (Optional)" error={form.formState.errors.managerId?.message}>
                <select className={selectClass} disabled={saving.isPending} {...form.register('managerId')}>
                  <option value="">No manager</option>
                  {possibleManagers.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeCode})</option>
                  ))}
                </select>
              </FormField>
              <FormField label="System Role" error={form.formState.errors.role?.message}>
                <select className={selectClass} disabled={saving.isPending} {...form.register('role')}>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                  <option value="HR">HR</option>
                  <option value="ADMIN">Director (Admin)</option>
                </select>
              </FormField>
              {field('allocatedLeaves', 'Allocated leaves (per year)', 'number')}
              {field('leaveBalance', 'Current leave balance', 'number')}
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Address</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {field('address', 'Address')}
              <SearchableInput label="City" name="city" suggestions={CITIES_LIST} form={form} disabled={saving.isPending} />
              <SearchableInput label="State" name="state" suggestions={STATES_LIST} form={form} disabled={saving.isPending} />
              <SearchableInput label="Country" name="country" suggestions={COUNTRIES_LIST} form={form} disabled={saving.isPending} />
              {field('postalCode', 'Postal code')}
              <FormField label="Upload profile image" error={imageError}>
                <Input className="mt-1.5" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" disabled={saving.isPending} onChange={event => pickImage(event.target.files?.[0])} />
                {profileImageUrl && <img src={profileImageUrl} alt="Profile preview" className="mt-3 size-20 rounded-full border border-slate-200 object-cover" />}
              </FormField>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t p-5 bg-slate-50 rounded-b-xl">
          <Button type="button" variant="outline" onClick={close} disabled={saving.isPending}>Cancel</Button>
          <Button type="submit" loading={saving.isPending}>{isEdit ? 'Save changes' : 'Create employee'}</Button>
        </div>
      </form>
    </div>
  )
}

function EmployeeDetailsModal({ employee: initialEmployee, close }: { employee?: EmployeeWithContact; close: () => void }) {
  const departments = useQuery({ queryKey: ['departments'], queryFn: departmentService.list })
  const employeesQuery = useQuery({ queryKey: ['employees'], queryFn: employeeService.list })
  const details = useQuery({
    queryKey: ['employee', initialEmployee?.id],
    queryFn: () => employeeService.get(initialEmployee!.id) as Promise<EmployeeWithContact>,
    enabled: !!initialEmployee?.id
  })
  const employee = details.data ?? initialEmployee
  const department = departments.data?.find(item => item.id === employee?.departmentId)?.name ?? employee?.departmentId

  const managerName = useMemo(() => {
    if (!employee?.managerId) return 'None'
    const mgr = employeesQuery.data?.find(item => item.id === employee.managerId)
    return mgr ? `${mgr.firstName} ${mgr.lastName} (${mgr.employeeCode})` : employee.managerId
  }, [employee?.managerId, employeesQuery.data])

  if (!employee && details.isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
        <div className="rounded-xl bg-white p-6 text-sm text-slate-600 shadow-2xl flex items-center gap-3">
          <LoaderCircle className="size-5 animate-spin text-blue-700" />
          Loading employee details…
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-100 text-left">
          <p className="text-sm font-semibold text-red-600">{messageFrom(details.error, 'Unable to load employee details')}</p>
          <div className="mt-5 text-right">
            <Button type="button" variant="outline" onClick={close}>Close</Button>
          </div>
        </div>
      </div>
    )
  }

  const values: Array<[string, React.ReactNode]> = [
    ['Employee code', employee.employeeCode],
    ['Name', `${employee.firstName} ${employee.lastName}`],
    ['Email', employee.email ?? employee.user?.email ?? 'Not available'],
    ['Phone', employee.phone ?? employee.user?.phone ?? 'Not available'],
    ['Department', department ?? 'Not available'],
    ['Designation', employee.designation],
    ['Manager', managerName],
    ['Leave balance', `${employee.leaveBalance ?? 20} / ${employee.allocatedLeaves ?? 20} days`],
    ['System Role', title(employee.user?.role ?? 'EMPLOYEE')],
    ['Employment type', title(employee.employmentType)],
    ['Gender', title(employee.gender)],
    ['Date of birth', date(employee.dateOfBirth)],
    ['Joining date', date(employee.joiningDate)],
    ['Address', employee.address],
    ['City', employee.city],
    ['State', employee.state],
    ['Country', employee.country],
    ['Postal code', employee.postalCode],
    ['Status', <Badge tone={employee.isActive ? 'green' : 'gray'}>{employee.isActive ? 'Active' : 'Inactive'}</Badge>],
    ['Created date', date(employee.createdAt)],
    ['Updated date', date(employee.updatedAt)]
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl bg-white shadow-2xl transition-all border border-slate-100 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-semibold text-slate-950">Employee details</h2>
          <button type="button" onClick={close} aria-label="Close" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition">
            <X className="size-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 text-left">
          <div className="mb-6 flex items-center gap-4">
            {employee.profileImageUrl ? (
              <img src={employee.profileImageUrl} alt={`${employee.firstName} ${employee.lastName}`} className="size-20 rounded-full border border-slate-200 object-cover" />
            ) : (
              <div className="grid size-20 place-items-center rounded-full bg-slate-100 text-xl font-semibold text-slate-500">
                {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-900">{employee.firstName} {employee.lastName}</p>
              <p className="text-sm text-slate-500">{employee.employeeCode}</p>
            </div>
          </div>
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {values.map(([label, value]) => (
              <div key={label} className="border-b border-slate-50 pb-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">{value || 'Not available'}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex justify-end border-t p-5 bg-slate-50 rounded-b-xl">
          <Button type="button" variant="outline" onClick={close}>Close</Button>
        </div>
      </div>
    </div>
  )
}

function DeactivateConfirmModal({ employee, onConfirm, close, loading }: { employee: Employee; onConfirm: () => void; close: () => void; loading: boolean }) {
  const [typedCode, setTypedCode] = useState('');
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl border border-slate-100 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
            <Trash2 className="size-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">Deactivate Employee</h3>
            <p className="mt-2 text-sm text-slate-500">
              Are you sure you want to deactivate this employee? This will suspend their account access and mark their profile as inactive.
            </p>
            
            <div className="mt-4 rounded-lg bg-slate-50 border border-slate-100 p-4 text-left">
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <span className="font-semibold text-slate-500">Name:</span>
                <span className="text-slate-800 font-medium">{employee.firstName} {employee.lastName}</span>
                
                <span className="font-semibold text-slate-500">Employee Code:</span>
                <span className="text-slate-800 font-mono font-medium">{employee.employeeCode}</span>
                
                <span className="font-semibold text-slate-500">Designation:</span>
                <span className="text-slate-800 font-medium">{employee.designation}</span>
              </div>
            </div>

            <label className="mt-5 block text-sm font-medium text-slate-700">
              Type the Employee Code <span className="font-mono text-red-600 font-bold">{employee.employeeCode}</span> to confirm:
              <Input
                required
                type="text"
                placeholder="Enter code"
                className="mt-2 font-mono text-sm tracking-widest placeholder:font-sans placeholder:tracking-normal"
                value={typedCode}
                onChange={e => setTypedCode(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t pt-4 bg-white rounded-b-xl">
          <Button type="button" variant="outline" onClick={close}>Cancel</Button>
          <Button
            type="button"
            className="bg-red-600 hover:bg-red-700 text-white"
            loading={loading}
            disabled={typedCode !== employee.employeeCode}
            onClick={onConfirm}
          >
            Deactivate
          </Button>
        </div>
      </div>
    </div>
  );
}

export function EmployeesPage() {
  const { hasRole } = useAuth()
  const client = useQueryClient()
  const [adding, setAdding] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<EmployeeWithContact | null | undefined>()
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithContact>()
  const [deactivatingEmployee, setDeactivatingEmployee] = useState<Employee | null>(null)
  const [search, setSearch] = useState('')
  const query = useQuery({ queryKey: ['employees'], queryFn: employeeService.list })
  const remove = useMutation({
    mutationFn: employeeService.remove,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee deactivated');
      setDeactivatingEmployee(null);
    },
    onError: () => toast.error('Unable to deactivate employee')
  })
  const rows = useMemo(() => (query.data ?? []).filter(employee => `${employee.firstName} ${employee.lastName} ${employee.employeeCode} ${employee.designation}`.toLowerCase().includes(search.toLowerCase())), [query.data, search])

  const columns: ColumnDef<Employee>[] = [
    {
      id: 'name',
      header: 'Employee',
      accessorFn: employee => `${employee.firstName} ${employee.lastName}`,
      cell: context => (
        <div className="text-left">
          <p className="font-medium text-slate-900">{context.row.original.firstName} {context.row.original.lastName}</p>
          <p className="text-xs text-slate-500">{context.row.original.employeeCode}</p>
        </div>
      )
    },
    { accessorKey: 'designation', header: 'Designation' },
    { accessorKey: 'employmentType', header: 'Type', cell: context => title(context.getValue<string>()) },
    { accessorKey: 'joiningDate', header: 'Joined', cell: context => date(context.getValue<string>()) },
    { accessorKey: 'isActive', header: 'Status', cell: context => <Badge tone={context.getValue() ? 'green' : 'gray'}>{context.getValue() ? 'Active' : 'Inactive'}</Badge> },
    {
      id: 'actions',
      header: '',
      cell: context => (
        <div className="flex gap-1">
          <button aria-label="View employee" onClick={() => setSelectedEmployee(context.row.original)} className="cursor-pointer rounded p-1.5 text-slate-500 hover:bg-slate-100">
            <Eye className="size-4" />
          </button>
          {hasRole('ADMIN', 'HR') && (
            <button aria-label="Edit employee" onClick={() => setEditingEmployee(context.row.original)} className="cursor-pointer rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700">
              <Pencil className="size-4" />
            </button>
          )}
          {hasRole('ADMIN', 'HR') && (
            <button aria-label="Deactivate employee" disabled={remove.isPending} onClick={() => setDeactivatingEmployee(context.row.original)} className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50">
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      )
    }
  ]

  return (
    <>
      <PageHeader title="Employees" description="Employee records and workforce directory." actions={hasRole('ADMIN', 'HR') ? <Button onClick={() => setAdding(true)}><Plus className="size-4" />Add employee</Button> : undefined} />
      <Card>
        <div className="mb-4 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-3 size-4 text-slate-400" />
            <Input className="pl-9" placeholder="Search employees" value={search} onChange={event => setSearch(event.target.value)} />
          </div>
        </div>
        {query.isLoading ? <Empty>Loading employees…</Empty> : <DataTable data={rows} columns={columns} />}
      </Card>
      {adding && <EmployeeModal close={() => setAdding(false)} />}
      {editingEmployee && <EmployeeModal employee={editingEmployee} close={() => setEditingEmployee(undefined)} />}
      {selectedEmployee && <EmployeeDetailsModal employee={selectedEmployee} close={() => setSelectedEmployee(undefined)} />}
      {deactivatingEmployee && (
        <DeactivateConfirmModal
          employee={deactivatingEmployee}
          close={() => setDeactivatingEmployee(null)}
          loading={remove.isPending}
          onConfirm={() => remove.mutate(deactivatingEmployee.id)}
        />
      )}
    </>
  )
}

const COUNTRIES_LIST = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "United Arab Emirates",
  "Singapore",
  "Japan",
  "Netherlands",
  "Switzerland",
  "New Zealand",
  "Ireland",
  "South Africa",
  "Saudi Arabia",
  "Qatar",
  "Oman",
  "Kuwait"
];

const STATES_LIST = [
  // India
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Telangana",
  "Tamil Nadu",
  "Uttar Pradesh",
  "Gujarat",
  "Rajasthan",
  "Haryana",
  "Punjab",
  "Madhya Pradesh",
  "Bihar",
  "West Bengal",
  "Kerala",
  "Andhra Pradesh",
  "Goa",
  "Assam",
  "Odisha",
  // US
  "California",
  "Texas",
  "New York",
  "Florida",
  "Illinois",
  "Pennsylvania",
  "Ohio",
  "Georgia",
  "North Carolina",
  "Michigan",
  "Washington"
];

const CITIES_LIST = [
  // India
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Noida",
  "Gurugram",
  "Chandigarh",
  "Indore",
  "Bhopal",
  "Patna",
  "Kochi",
  "Visakhapatnam",
  // US
  "New York City",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
  "San Jose",
  "Austin",
  "San Francisco",
  "Seattle"
];

function SearchableInput({
  label,
  name,
  suggestions,
  form,
  disabled
}: {
  label: string;
  name: any;
  suggestions: string[];
  form: any;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const value = form.watch(name) || "";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = query
    ? suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase()))
    : suggestions;

  return (
    <div ref={wrapperRef} className="relative text-left">
      <FormField label={label} error={form.formState.errors[name]?.message}>
        <div className="relative mt-1.5">
          <Input
            type="text"
            disabled={disabled}
            placeholder={`Select or type ${label.toLowerCase()}...`}
            value={value}
            onChange={(e) => {
              setQuery(e.target.value);
              form.setValue(name, e.target.value, { shouldValidate: true });
              setIsOpen(true);
            }}
            onFocus={() => {
              setQuery(value);
              setIsOpen(true);
            }}
          />
          {isOpen && filtered.length > 0 && (
            <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 outline-none">
              {filtered.slice(0, 100).map((item, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    form.setValue(name, item, { shouldValidate: true });
                    setQuery(item);
                    setIsOpen(false);
                  }}
                  className="relative cursor-pointer select-none px-4 py-2.5 hover:bg-slate-100 text-slate-800 font-normal transition-colors"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </FormField>
    </div>
  );
}
