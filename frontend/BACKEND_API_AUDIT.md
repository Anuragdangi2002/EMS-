# Backend API audit

This frontend was built only against the routes defined in `../src/routes` and controllers/services/validations/repositories in the backend.

## Common contract

- Base URL: `/api/v1`
- Success: `{ success: true, message, data }`
- Failure: `{ success: false, message, errors }`
- Access token: `Authorization: Bearer <JWT>`
- Refresh token: HttpOnly `refreshToken` cookie, scoped to `/api/v1/auth`
- Roles in the schema and implemented role checks: `ADMIN`, `HR`, `EMPLOYEE`

## Implemented routes

| Area | Route | Body / response `data` | Access |
|---|---|---|---|
| Auth | `POST /auth/register` | `{ email, password, firstName, lastName, phone?, role? }` → `{ user, accessToken }` | Public |
| Auth | `POST /auth/login` | `{ email, password }` → `{ user, accessToken }` | Public |
| Auth | `POST /auth/refresh` | Cookie (or `{ refreshToken }`) → `{ accessToken }` | Public |
| Auth | `POST /auth/forgot-password` | `{ email }` → `null` | Public |
| Auth | `POST /auth/reset-password` | `{ token, password }` → `null` | Public |
| Auth | `POST /auth/logout`, `GET /auth/me` | `null` / `{ user }` | Authenticated |
| Employees | `POST /employees`, `GET /employees`, `GET /employees/me`, `GET/PUT/DELETE /employees/:id` | `{ employee }`, `{ employees }` | Admin/HR except `/me`; DELETE Admin |
| Departments | `POST/GET /departments`, `GET/PUT/DELETE /departments/:id` | `{ department }`, `{ departments }` | Read authenticated; write Admin/HR |
| Shifts | `POST/GET /shifts`, `GET/PUT/DELETE /shifts/:id` | `{ shift }`, `{ shifts }` | Read authenticated; write Admin/HR |
| Attendance | `POST /attendance/check-in`, `POST /attendance/check-out` | `{ employeeId }` → `{ attendance }` | Authenticated |
| Attendance | `GET /attendance`, `GET /attendance/employee/:employeeId` | `{ attendance }` | List Admin/HR; history authenticated |
| Leaves | `POST/GET /leaves`, `PATCH /leaves/:id/status` | Apply `{ employeeId, startDate, endDate, reason }`; status `{ status: APPROVED\|REJECTED }` | Apply authenticated; list/status Admin/HR |
| Dashboard | `GET /dashboard` | `{ dashboard: { totalEmployees, activeEmployees, departments, shifts, presentToday, lateToday, absentToday, employeesOnLeave } }` | Admin/HR |

## Findings that prevent some requested UX

1. The backend currently fails `npm run build`. Its source references Prisma RBAC/audit models and enums not declared in `prisma/schema.prisma`; `EmployeeCreateInput` also has no `phone` field but the service sends it.
2. Employee creation has an executable contract mismatch: validation requires `department: string`, but the service passes that string into the Prisma `department` relation, which expects a nested relation object. The frontend sends the validated API payload and reports the failure rather than inventing a different endpoint/shape.
3. The routes do not expose employee self leave history, settings, monthly/filtered attendance, dashboard charts/trends, or server-side list pagination/search/filter/sort. The UI only provides corresponding controls where they can be performed safely client-side, and displays unavailable states elsewhere.
4. `forgot-password` deliberately only logs the reset token server-side; there is no email delivery or reset-link endpoint.
5. With `withCredentials: true`, configure the backend `CORS_ORIGIN` as the frontend origin (for example `http://localhost:5173`), not `*`.
