export const ENDPOINTS = {
  auth: { login: '/auth/login', register: '/auth/register', logout: '/auth/logout', refresh: '/auth/refresh', me: '/auth/me', forgotPassword: '/auth/forgot-password', resetPassword: '/auth/reset-password' },
  employees: '/employees',
  departments: '/departments',
  shifts: '/shifts',
  attendance: { base: '/attendance', checkIn: '/attendance/check-in', checkOut: '/attendance/check-out', employee: (id: string) => `/attendance/employee/${id}` },
  leaves: '/leaves',
  dashboard: '/dashboard',
  holidays: '/holidays'
} as const
