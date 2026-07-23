import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Plus, Trash2, X, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, Button, Input, Badge, Empty } from '../components/ui'
import { PageHeader } from '../layouts/app-layout'
import { holidayService } from '../services/ems.service'
import type { Holiday } from '../types/models'
import { useAuth } from '../store/auth-context'
import { date as formatDate } from '../utils/format'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function HolidayModal({ holiday, defaultDate, close }: { holiday?: Holiday; defaultDate?: string; close: () => void }) {
  const client = useQueryClient()
  const isEdit = !!holiday
  const [form, setForm] = useState({
    title: holiday?.title ?? '',
    date: holiday?.date ? holiday.date.slice(0, 10) : (defaultDate ?? new Date().toISOString().slice(0, 10)),
    description: holiday?.description ?? '',
    isOptional: holiday?.isOptional ?? false
  })

  const save = useMutation({
    mutationFn: () => isEdit ? holidayService.update(holiday.id, form) : holidayService.create(form),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['holidays'] })
      toast.success(isEdit ? 'Holiday updated' : 'Holiday created')
      close()
    },
    onError: () => toast.error('Unable to save holiday')
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm overflow-y-auto">
      <form
        onSubmit={e => { e.preventDefault(); save.mutate() }}
        className="relative w-full max-w-md rounded-xl bg-white shadow-2xl transition-all border border-slate-100 max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-slate-955">{isEdit ? 'Edit Holiday' : 'Add Holiday'}</h2>
          <button type="button" onClick={close} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition">
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-4 p-5 overflow-y-auto flex-1 text-left">
          <label className="block text-sm font-medium text-slate-700">
            Holiday Title
            <Input required type="text" className="mt-1.5" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Date
            <Input required type="date" className="mt-1.5" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Description (Optional)
            <textarea
              className="mt-1.5 min-h-20 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none transition focus:border-blue-600 focus:ring-3 focus:ring-blue-100"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 select-none cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 size-4 cursor-pointer"
              checked={form.isOptional}
              onChange={e => setForm({ ...form, isOptional: e.target.checked })}
            />
            <span>This is an optional holiday</span>
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t p-5 bg-slate-50 rounded-b-xl">
          <Button type="button" variant="outline" onClick={close}>Cancel</Button>
          <Button loading={save.isPending}>Save holiday</Button>
        </div>
      </form>
    </div>
  )
}

export function HolidaysPage() {
  const { hasRole } = useAuth()
  const client = useQueryClient()
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null | undefined>()
  const [addingDate, setAddingDate] = useState<string | null>(null)

  const canEdit = hasRole('ADMIN', 'HR')
  const query = useQuery({ queryKey: ['holidays'], queryFn: holidayService.list })

  const remove = useMutation({
    mutationFn: holidayService.remove,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['holidays'] })
      toast.success('Holiday removed')
    },
    onError: () => toast.error('Unable to remove holiday')
  })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Calendar math
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month])
  const firstDayIndex = useMemo(() => new Date(year, month, 1).getDay(), [year, month])

  const prevMonthDays = useMemo(() => {
    const prevYear = month === 0 ? year - 1 : year
    const prevMonth = month === 0 ? 11 : month - 1
    const totalDays = new Date(prevYear, prevMonth + 1, 0).getDate()
    return Array.from({ length: firstDayIndex }, (_, i) => {
      const day = totalDays - firstDayIndex + i + 1
      return { day, month: prevMonth, year: prevYear, current: false }
    })
  }, [year, month, firstDayIndex])

  const currentMonthDays = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      return { day, month, year, current: true }
    })
  }, [year, month, daysInMonth])

  const calendarDays = useMemo(() => {
    const days = [...prevMonthDays, ...currentMonthDays]
    // Padding at the end to make it a multiple of 7
    const remaining = 42 - days.length
    const nextYear = month === 11 ? year + 1 : year
    const nextMonth = month === 11 ? 0 : month + 1
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, month: nextMonth, year: nextYear, current: false })
    }
    return days
  }, [prevMonthDays, currentMonthDays, month, year])

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const holidaysMap = useMemo(() => {
    const map: Record<string, Holiday[]> = {}
    ;(query.data ?? []).forEach(h => {
      const dateKey = new Date(h.date).toISOString().slice(0, 10)
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push(h)
    })
    return map
  }, [query.data])

  const upcomingHolidays = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10)
    return (query.data ?? [])
      .filter(h => h.date.slice(0, 10) >= todayStr)
      .slice(0, 6)
  }, [query.data])

  const todayStr = new Date().toDateString()

  return (
    <>
      <PageHeader
        title="Calendar & Holidays"
        description="View annual organisation holidays and optional days off."
        actions={canEdit ? <Button onClick={() => setAddingDate(new Date().toISOString().slice(0, 10))}><Plus className="size-4" />Add Holiday</Button> : undefined}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Grid Section */}
        <div className="lg:col-span-2">
          <Card>
            {/* Calendar Controls */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {MONTHS[month]} {year}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition active:scale-95"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition active:scale-95"
                  aria-label="Next month"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>

            {/* Weekdays Headers */}
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-slate-500 text-xs mb-2">
              {WEEKDAYS.map(w => <div key={w} className="py-2">{w}</div>)}
            </div>

            {/* Calendar Grid Cells */}
            <div className="grid grid-cols-7 gap-1 bg-slate-100 p-0.5 rounded-xl">
              {calendarDays.map((cell, idx) => {
                const cellDate = new Date(cell.year, cell.month, cell.day)
                const dateKey = cellDate.toISOString().slice(0, 10)
                const cellHolidays = holidaysMap[dateKey] ?? []
                const isToday = cellDate.toDateString() === todayStr

                return (
                  <div
                    key={`${dateKey}-${idx}`}
                    onClick={() => {
                      if (canEdit) {
                        if (cellHolidays.length > 0) {
                          setEditingHoliday(cellHolidays[0])
                        } else {
                          setAddingDate(dateKey)
                        }
                      }
                    }}
                    className={`min-h-[90px] rounded-lg bg-white p-2 flex flex-col justify-between transition-all select-none ${
                      cell.current ? 'text-slate-800' : 'text-slate-350 bg-slate-50/50'
                    } ${canEdit ? 'cursor-pointer hover:bg-slate-50' : ''} ${
                      isToday ? 'ring-2 ring-blue-600 ring-offset-2' : ''
                    }`}
                  >
                    <span className={`text-xs font-bold ${isToday ? 'text-blue-700' : ''}`}>
                      {cell.day}
                    </span>
                    <div className="flex-1 flex flex-col gap-1 mt-1 overflow-hidden">
                      {cellHolidays.map(h => (
                        <div
                          key={h.id}
                          title={`${h.title}${h.description ? ` - ${h.description}` : ''}`}
                          className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium leading-tight text-left ${
                            h.isOptional
                              ? 'bg-amber-50 text-amber-800 border border-amber-100'
                              : 'bg-red-50 text-red-800 border border-red-100'
                          }`}
                        >
                          {h.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Sidebar Listings Section */}
        <div className="space-y-6">
          <Card title="Upcoming Holidays">
            {query.isLoading ? (
              <Empty>Loading holidays…</Empty>
            ) : upcomingHolidays.length === 0 ? (
              <Empty>No upcoming holidays found.</Empty>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingHolidays.map(h => (
                  <div key={h.id} className="py-3 flex items-start justify-between gap-3 text-left">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-slate-800 truncate">{h.title}</p>
                        {h.isOptional && <Badge tone="yellow">Optional</Badge>}
                      </div>
                      <p className="text-xs text-blue-700 font-medium mt-0.5">{formatDate(h.date)}</p>
                      {h.description && <p className="text-xs text-slate-500 mt-1">{h.description}</p>}
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => { if (confirm('Remove this holiday?')) remove.mutate(h.id) }}
                        disabled={remove.isPending}
                        className="rounded p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 transition"
                        title="Delete holiday"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Calendar Legend">
            <div className="space-y-3 text-sm text-slate-600 text-left">
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded bg-red-50 border border-red-100 shrink-0" />
                <span>**Official Holiday** (Paid day off)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded bg-amber-50 border border-amber-100 shrink-0" />
                <span>**Optional Holiday** (Choice base/restricted)</span>
              </div>
              {canEdit && (
                <div className="flex items-start gap-2.5 rounded-lg bg-blue-50/50 p-3 text-xs text-blue-800 border border-blue-100/50">
                  <AlertCircle className="size-4 shrink-0 text-blue-600 mt-0.5" />
                  <span>As HR, you can **click on any date** in the calendar or click the button above to add new holidays.</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {addingDate && <HolidayModal defaultDate={addingDate} close={() => setAddingDate(null)} />}
      {editingHoliday && <HolidayModal holiday={editingHoliday} close={() => setEditingHoliday(undefined)} />}
    </>
  )
}
