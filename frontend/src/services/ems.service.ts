import { api, unwrap } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import type { Attendance, Dashboard, Department, Employee, Holiday, Leave, LeaveStatus, Shift } from '../types/models'

const get = <T>(url: string) => api.get(url).then(unwrap<T>)
const post = <T>(url: string, body: unknown) => api.post(url, body).then(unwrap<T>)
const put = <T>(url: string, body: unknown) => api.put(url, body).then(unwrap<T>)
const remove = (url: string) => api.delete(url).then(unwrap<null>)

export const employeeService = {
  list: () => get<{ employees: Employee[] }>(ENDPOINTS.employees).then(x => x.employees),
  get: (id: string) => get<{ employee: Employee }>(`${ENDPOINTS.employees}/${id}`).then(x => x.employee),
  me: () => get<{ employee: Employee }>(`${ENDPOINTS.employees}/me`).then(x => x.employee),
  create: (body: unknown) => post<{ employee: Employee }>(ENDPOINTS.employees, body).then(x => x.employee),
  update: (id: string, body: unknown) => put<{ employee: Employee }>(`${ENDPOINTS.employees}/${id}`, body).then(x => x.employee),
  remove: (id: string) => remove(`${ENDPOINTS.employees}/${id}`),
  myTeam: () => get<{ team: { manager: Employee | null; peers: Employee[]; subordinates: Employee[] } }>(`${ENDPOINTS.employees}/my-team`).then(x => x.team)
}
export const departmentService = {
  list: () => get<{ departments: Department[] }>(ENDPOINTS.departments).then(x => x.departments),
  create: (body: Partial<Department>) => post<{ department: Department }>(ENDPOINTS.departments, body).then(x => x.department),
  update: (id: string, body: Partial<Department>) => put<{ department: Department }>(`${ENDPOINTS.departments}/${id}`, body).then(x => x.department),
  remove: (id: string) => remove(`${ENDPOINTS.departments}/${id}`)
}
export const shiftService = {
  list: () => get<{ shifts: Shift[] }>(ENDPOINTS.shifts).then(x => x.shifts),
  create: (body: Partial<Shift>) => post<{ shift: Shift }>(ENDPOINTS.shifts, body).then(x => x.shift),
  update: (id: string, body: Partial<Shift>) => put<{ shift: Shift }>(`${ENDPOINTS.shifts}/${id}`, body).then(x => x.shift),
  remove: (id: string) => remove(`${ENDPOINTS.shifts}/${id}`)
}
export const attendanceService = {
  list: () => get<{ attendance: Attendance[] }>(ENDPOINTS.attendance.base).then(x => x.attendance),
  history: (employeeId: string) => get<{ attendance: Attendance[] }>(ENDPOINTS.attendance.employee(employeeId)).then(x => x.attendance),
  checkIn: (employeeId: string) => post<{ attendance: Attendance }>(ENDPOINTS.attendance.checkIn, { employeeId }).then(x => x.attendance),
  checkOut: (employeeId: string) => post<{ attendance: Attendance }>(ENDPOINTS.attendance.checkOut, { employeeId }).then(x => x.attendance)
}
export const leaveService = {
  list: () => get<{ leaves: Leave[] }>(ENDPOINTS.leaves).then(x => x.leaves),
  apply: (body: { employeeId: string; startDate: string; endDate: string; reason: string }) => post<{ leave: Leave }>(ENDPOINTS.leaves, body).then(x => x.leave),
  status: (id: string, status: LeaveStatus) => api.patch(`${ENDPOINTS.leaves}/${id}/status`, { status }).then(unwrap<{ leave: Leave }>).then(x => x.leave)
}
export const dashboardService = { get: () => get<{ dashboard: Dashboard }>(ENDPOINTS.dashboard).then(x => x.dashboard) }
export const holidayService = {
  list: () => get<{ holidays: Holiday[] }>(ENDPOINTS.holidays).then(x => x.holidays),
  create: (body: Partial<Holiday>) => post<{ holiday: Holiday }>(ENDPOINTS.holidays, body).then(x => x.holiday),
  update: (id: string, body: Partial<Holiday>) => put<{ holiday: Holiday }>(`${ENDPOINTS.holidays}/${id}`, body).then(x => x.holiday),
  remove: (id: string) => remove(`${ENDPOINTS.holidays}/${id}`)
}
