import { useMemo, useState, type ReactNode } from 'react'
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState } from '@tanstack/react-table'
import { ArrowDownUp } from 'lucide-react'
import { Empty } from './ui'

export function DataTable<T>({ data, columns, empty = 'No records found.' }: { data: T[]; columns: ColumnDef<T>[]; empty?: ReactNode }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable({ data, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() })
  const rows = useMemo(() => table.getRowModel().rows, [table, data, sorting])
  return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">{table.getHeaderGroups().map(group => <tr key={group.id}>{group.headers.map(header => <th key={header.id} className="whitespace-nowrap px-4 py-3 font-semibold">{header.isPlaceholder ? null : <button className="flex items-center gap-1" onClick={header.column.getToggleSortingHandler()}>{flexRender(header.column.columnDef.header, header.getContext())}{header.column.getCanSort() && <ArrowDownUp className="size-3" />}</button>}</th>)}</tr>)}</thead><tbody className="divide-y divide-slate-100 text-slate-700">{rows.map(row => <tr key={row.id} className="hover:bg-slate-50">{row.getVisibleCells().map(cell => <td key={cell.id} className="whitespace-nowrap px-4 py-3.5">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table>{!rows.length && <Empty>{empty}</Empty>}</div>
}
