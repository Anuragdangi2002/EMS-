/**
 * All permission strings used across the EMS system.
 * Format: "module:action"
 * These are seeded into the database and used for configurable RBAC.
 */
export const Permissions = {
  // User Management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_CHANGE_ROLE: 'user:change_role',
  USER_CHANGE_STATUS: 'user:change_status',

  // Employee
  EMPLOYEE_CREATE: 'employee:create',
  EMPLOYEE_READ: 'employee:read',
  EMPLOYEE_READ_OWN: 'employee:read_own',
  EMPLOYEE_UPDATE: 'employee:update',
  EMPLOYEE_UPDATE_OWN: 'employee:update_own',
  EMPLOYEE_DELETE: 'employee:delete',

  // Department
  DEPARTMENT_CREATE: 'department:create',
  DEPARTMENT_READ: 'department:read',
  DEPARTMENT_UPDATE: 'department:update',
  DEPARTMENT_DELETE: 'department:delete',

  // Designation
  DESIGNATION_CREATE: 'designation:create',
  DESIGNATION_READ: 'designation:read',
  DESIGNATION_UPDATE: 'designation:update',
  DESIGNATION_DELETE: 'designation:delete',

  // Office Location
  OFFICE_LOCATION_CREATE: 'office_location:create',
  OFFICE_LOCATION_READ: 'office_location:read',
  OFFICE_LOCATION_UPDATE: 'office_location:update',
  OFFICE_LOCATION_DELETE: 'office_location:delete',

  // Shift
  SHIFT_CREATE: 'shift:create',
  SHIFT_READ: 'shift:read',
  SHIFT_UPDATE: 'shift:update',
  SHIFT_DELETE: 'shift:delete',

  // Holiday
  HOLIDAY_CREATE: 'holiday:create',
  HOLIDAY_READ: 'holiday:read',
  HOLIDAY_UPDATE: 'holiday:update',
  HOLIDAY_DELETE: 'holiday:delete',

  // Attendance
  ATTENDANCE_READ: 'attendance:read',
  ATTENDANCE_READ_OWN: 'attendance:read_own',
  ATTENDANCE_CREATE: 'attendance:create',
  ATTENDANCE_UPDATE: 'attendance:update',
  ATTENDANCE_CLOCK_IN: 'attendance:clock_in',
  ATTENDANCE_CLOCK_OUT: 'attendance:clock_out',

  // Leave
  LEAVE_TYPE_CREATE: 'leave_type:create',
  LEAVE_TYPE_UPDATE: 'leave_type:update',
  LEAVE_TYPE_DELETE: 'leave_type:delete',
  LEAVE_TYPE_READ: 'leave_type:read',
  LEAVE_APPLY: 'leave:apply',
  LEAVE_APPROVE: 'leave:approve',
  LEAVE_REJECT: 'leave:reject',
  LEAVE_CANCEL: 'leave:cancel',
  LEAVE_READ: 'leave:read',
  LEAVE_READ_OWN: 'leave:read_own',
  LEAVE_BALANCE_READ: 'leave_balance:read',
  LEAVE_BALANCE_READ_OWN: 'leave_balance:read_own',

  // Payroll
  PAYROLL_CREATE: 'payroll:create',
  PAYROLL_READ: 'payroll:read',
  PAYROLL_READ_OWN: 'payroll:read_own',
  PAYROLL_UPDATE: 'payroll:update',
  PAYROLL_APPROVE: 'payroll:approve',
  PAYROLL_DELETE: 'payroll:delete',

  // Salary Component
  SALARY_COMPONENT_CREATE: 'salary_component:create',
  SALARY_COMPONENT_READ: 'salary_component:read',
  SALARY_COMPONENT_UPDATE: 'salary_component:update',
  SALARY_COMPONENT_DELETE: 'salary_component:delete',

  // Reimbursement
  REIMBURSEMENT_SUBMIT: 'reimbursement:submit',
  REIMBURSEMENT_READ: 'reimbursement:read',
  REIMBURSEMENT_READ_OWN: 'reimbursement:read_own',
  REIMBURSEMENT_APPROVE: 'reimbursement:approve',
  REIMBURSEMENT_REJECT: 'reimbursement:reject',
  REIMBURSEMENT_DELETE: 'reimbursement:delete',

  // Assets
  ASSET_CREATE: 'asset:create',
  ASSET_READ: 'asset:read',
  ASSET_UPDATE: 'asset:update',
  ASSET_DELETE: 'asset:delete',
  ASSET_ASSIGN: 'asset:assign',
  ASSET_RETURN: 'asset:return',

  // Projects
  PROJECT_CREATE: 'project:create',
  PROJECT_READ: 'project:read',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  PROJECT_MEMBER_ADD: 'project:member_add',
  PROJECT_MEMBER_REMOVE: 'project:member_remove',

  // Teams
  TEAM_CREATE: 'team:create',
  TEAM_READ: 'team:read',
  TEAM_UPDATE: 'team:update',
  TEAM_DELETE: 'team:delete',
  TEAM_MEMBER_ADD: 'team:member_add',
  TEAM_MEMBER_REMOVE: 'team:member_remove',

  // Performance
  PERFORMANCE_CYCLE_CREATE: 'performance_cycle:create',
  PERFORMANCE_CYCLE_UPDATE: 'performance_cycle:update',
  PERFORMANCE_CYCLE_DELETE: 'performance_cycle:delete',
  PERFORMANCE_REVIEW_CREATE: 'performance_review:create',
  PERFORMANCE_REVIEW_READ: 'performance_review:read',
  PERFORMANCE_REVIEW_READ_OWN: 'performance_review:read_own',
  PERFORMANCE_REVIEW_SUBMIT: 'performance_review:submit',

  // Announcements
  ANNOUNCEMENT_CREATE: 'announcement:create',
  ANNOUNCEMENT_READ: 'announcement:read',
  ANNOUNCEMENT_UPDATE: 'announcement:update',
  ANNOUNCEMENT_DELETE: 'announcement:delete',
  ANNOUNCEMENT_PUBLISH: 'announcement:publish',

  // Documents
  DOCUMENT_CREATE: 'document:create',
  DOCUMENT_READ: 'document:read',
  DOCUMENT_READ_OWN: 'document:read_own',
  DOCUMENT_UPDATE: 'document:update',
  DOCUMENT_DELETE: 'document:delete',
  DOCUMENT_VERIFY: 'document:verify',

  // Recruitment
  RECRUITMENT_JOB_CREATE: 'recruitment_job:create',
  RECRUITMENT_JOB_UPDATE: 'recruitment_job:update',
  RECRUITMENT_JOB_DELETE: 'recruitment_job:delete',
  RECRUITMENT_JOB_READ: 'recruitment_job:read',
  RECRUITMENT_APPLICATION_READ: 'recruitment_application:read',
  RECRUITMENT_APPLICATION_UPDATE: 'recruitment_application:update',

  // Onboarding
  ONBOARDING_TASK_CREATE: 'onboarding_task:create',
  ONBOARDING_TASK_UPDATE: 'onboarding_task:update',
  ONBOARDING_TASK_READ: 'onboarding_task:read',
  ONBOARDING_PROGRESS_UPDATE: 'onboarding_progress:update',

  // Offboarding
  OFFBOARDING_INITIATE: 'offboarding:initiate',
  OFFBOARDING_TASK_CREATE: 'offboarding_task:create',
  OFFBOARDING_TASK_UPDATE: 'offboarding_task:update',
  OFFBOARDING_TASK_READ: 'offboarding_task:read',
  OFFBOARDING_PROGRESS_UPDATE: 'offboarding_progress:update',

  // Reports
  REPORT_HEADCOUNT: 'report:headcount',
  REPORT_ATTENDANCE: 'report:attendance',
  REPORT_PAYROLL: 'report:payroll',
  REPORT_LEAVE: 'report:leave',

  // Dashboard
  DASHBOARD_READ: 'dashboard:read',

  // Audit Logs
  AUDIT_LOG_READ: 'audit_log:read',

  // Settings
  SETTING_READ: 'setting:read',
  SETTING_UPDATE: 'setting:update',

  // RBAC
  PERMISSION_READ: 'permission:read',
  PERMISSION_UPDATE: 'permission:update'
} as const;

export type PermissionKey = typeof Permissions[keyof typeof Permissions];

/**
 * Default permission grants per role.
 * Used for initial database seeding.
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  SUPER_ADMIN: Object.values(Permissions),

  DIRECTOR: [
    Permissions.USER_CREATE, Permissions.USER_READ, Permissions.USER_UPDATE,
    Permissions.USER_DELETE, Permissions.USER_CHANGE_ROLE, Permissions.USER_CHANGE_STATUS,
    Permissions.EMPLOYEE_CREATE, Permissions.EMPLOYEE_READ, Permissions.EMPLOYEE_UPDATE,
    Permissions.EMPLOYEE_DELETE, Permissions.EMPLOYEE_READ_OWN, Permissions.EMPLOYEE_UPDATE_OWN,
    Permissions.DEPARTMENT_CREATE, Permissions.DEPARTMENT_READ, Permissions.DEPARTMENT_UPDATE, Permissions.DEPARTMENT_DELETE,
    Permissions.DESIGNATION_CREATE, Permissions.DESIGNATION_READ, Permissions.DESIGNATION_UPDATE, Permissions.DESIGNATION_DELETE,
    Permissions.OFFICE_LOCATION_CREATE, Permissions.OFFICE_LOCATION_READ, Permissions.OFFICE_LOCATION_UPDATE, Permissions.OFFICE_LOCATION_DELETE,
    Permissions.SHIFT_CREATE, Permissions.SHIFT_READ, Permissions.SHIFT_UPDATE, Permissions.SHIFT_DELETE,
    Permissions.HOLIDAY_CREATE, Permissions.HOLIDAY_READ, Permissions.HOLIDAY_UPDATE, Permissions.HOLIDAY_DELETE,
    Permissions.ATTENDANCE_READ, Permissions.ATTENDANCE_READ_OWN, Permissions.ATTENDANCE_CREATE,
    Permissions.ATTENDANCE_UPDATE, Permissions.ATTENDANCE_CLOCK_IN, Permissions.ATTENDANCE_CLOCK_OUT,
    Permissions.LEAVE_TYPE_CREATE, Permissions.LEAVE_TYPE_UPDATE, Permissions.LEAVE_TYPE_DELETE, Permissions.LEAVE_TYPE_READ,
    Permissions.LEAVE_APPLY, Permissions.LEAVE_APPROVE, Permissions.LEAVE_REJECT, Permissions.LEAVE_CANCEL,
    Permissions.LEAVE_READ, Permissions.LEAVE_READ_OWN, Permissions.LEAVE_BALANCE_READ, Permissions.LEAVE_BALANCE_READ_OWN,
    Permissions.PAYROLL_CREATE, Permissions.PAYROLL_READ, Permissions.PAYROLL_UPDATE, Permissions.PAYROLL_APPROVE, Permissions.PAYROLL_DELETE,
    Permissions.PAYROLL_READ_OWN,
    Permissions.SALARY_COMPONENT_CREATE, Permissions.SALARY_COMPONENT_READ, Permissions.SALARY_COMPONENT_UPDATE, Permissions.SALARY_COMPONENT_DELETE,
    Permissions.REIMBURSEMENT_SUBMIT, Permissions.REIMBURSEMENT_READ, Permissions.REIMBURSEMENT_APPROVE,
    Permissions.REIMBURSEMENT_REJECT, Permissions.REIMBURSEMENT_DELETE, Permissions.REIMBURSEMENT_READ_OWN,
    Permissions.ASSET_CREATE, Permissions.ASSET_READ, Permissions.ASSET_UPDATE, Permissions.ASSET_DELETE,
    Permissions.ASSET_ASSIGN, Permissions.ASSET_RETURN,
    Permissions.PROJECT_CREATE, Permissions.PROJECT_READ, Permissions.PROJECT_UPDATE, Permissions.PROJECT_DELETE,
    Permissions.PROJECT_MEMBER_ADD, Permissions.PROJECT_MEMBER_REMOVE,
    Permissions.TEAM_CREATE, Permissions.TEAM_READ, Permissions.TEAM_UPDATE, Permissions.TEAM_DELETE,
    Permissions.TEAM_MEMBER_ADD, Permissions.TEAM_MEMBER_REMOVE,
    Permissions.PERFORMANCE_CYCLE_CREATE, Permissions.PERFORMANCE_CYCLE_UPDATE, Permissions.PERFORMANCE_CYCLE_DELETE,
    Permissions.PERFORMANCE_REVIEW_CREATE, Permissions.PERFORMANCE_REVIEW_READ,
    Permissions.ANNOUNCEMENT_CREATE, Permissions.ANNOUNCEMENT_READ, Permissions.ANNOUNCEMENT_UPDATE,
    Permissions.ANNOUNCEMENT_DELETE, Permissions.ANNOUNCEMENT_PUBLISH,
    Permissions.DOCUMENT_CREATE, Permissions.DOCUMENT_READ, Permissions.DOCUMENT_UPDATE,
    Permissions.DOCUMENT_DELETE, Permissions.DOCUMENT_VERIFY, Permissions.DOCUMENT_READ_OWN,
    Permissions.RECRUITMENT_JOB_CREATE, Permissions.RECRUITMENT_JOB_UPDATE, Permissions.RECRUITMENT_JOB_DELETE,
    Permissions.RECRUITMENT_JOB_READ, Permissions.RECRUITMENT_APPLICATION_READ, Permissions.RECRUITMENT_APPLICATION_UPDATE,
    Permissions.ONBOARDING_TASK_CREATE, Permissions.ONBOARDING_TASK_UPDATE, Permissions.ONBOARDING_TASK_READ,
    Permissions.ONBOARDING_PROGRESS_UPDATE,
    Permissions.OFFBOARDING_INITIATE, Permissions.OFFBOARDING_TASK_CREATE, Permissions.OFFBOARDING_TASK_UPDATE,
    Permissions.OFFBOARDING_TASK_READ, Permissions.OFFBOARDING_PROGRESS_UPDATE,
    Permissions.REPORT_HEADCOUNT, Permissions.REPORT_ATTENDANCE, Permissions.REPORT_PAYROLL, Permissions.REPORT_LEAVE,
    Permissions.DASHBOARD_READ,
    Permissions.AUDIT_LOG_READ,
    Permissions.SETTING_READ, Permissions.SETTING_UPDATE,
    Permissions.PERMISSION_READ, Permissions.PERMISSION_UPDATE
  ],

  HR: [
    Permissions.USER_CREATE, Permissions.USER_READ, Permissions.USER_UPDATE,
    Permissions.EMPLOYEE_CREATE, Permissions.EMPLOYEE_READ, Permissions.EMPLOYEE_UPDATE,
    Permissions.EMPLOYEE_READ_OWN, Permissions.EMPLOYEE_UPDATE_OWN,
    Permissions.DEPARTMENT_READ, Permissions.DESIGNATION_READ,
    Permissions.OFFICE_LOCATION_READ, Permissions.SHIFT_READ,
    Permissions.HOLIDAY_CREATE, Permissions.HOLIDAY_READ, Permissions.HOLIDAY_UPDATE, Permissions.HOLIDAY_DELETE,
    Permissions.ATTENDANCE_READ, Permissions.ATTENDANCE_READ_OWN, Permissions.ATTENDANCE_CREATE,
    Permissions.ATTENDANCE_UPDATE, Permissions.ATTENDANCE_CLOCK_IN, Permissions.ATTENDANCE_CLOCK_OUT,
    Permissions.LEAVE_TYPE_CREATE, Permissions.LEAVE_TYPE_UPDATE, Permissions.LEAVE_TYPE_READ,
    Permissions.LEAVE_APPLY, Permissions.LEAVE_APPROVE, Permissions.LEAVE_REJECT, Permissions.LEAVE_CANCEL,
    Permissions.LEAVE_READ, Permissions.LEAVE_READ_OWN, Permissions.LEAVE_BALANCE_READ, Permissions.LEAVE_BALANCE_READ_OWN,
    Permissions.PAYROLL_CREATE, Permissions.PAYROLL_READ, Permissions.PAYROLL_UPDATE, Permissions.PAYROLL_READ_OWN,
    Permissions.SALARY_COMPONENT_READ,
    Permissions.REIMBURSEMENT_SUBMIT, Permissions.REIMBURSEMENT_READ, Permissions.REIMBURSEMENT_APPROVE,
    Permissions.REIMBURSEMENT_REJECT, Permissions.REIMBURSEMENT_READ_OWN,
    Permissions.ASSET_READ, Permissions.ASSET_ASSIGN, Permissions.ASSET_RETURN,
    Permissions.PROJECT_READ, Permissions.TEAM_READ,
    Permissions.PERFORMANCE_REVIEW_CREATE, Permissions.PERFORMANCE_REVIEW_READ,
    Permissions.ANNOUNCEMENT_CREATE, Permissions.ANNOUNCEMENT_READ, Permissions.ANNOUNCEMENT_UPDATE, Permissions.ANNOUNCEMENT_PUBLISH,
    Permissions.DOCUMENT_CREATE, Permissions.DOCUMENT_READ, Permissions.DOCUMENT_UPDATE, Permissions.DOCUMENT_VERIFY, Permissions.DOCUMENT_READ_OWN,
    Permissions.RECRUITMENT_JOB_CREATE, Permissions.RECRUITMENT_JOB_UPDATE, Permissions.RECRUITMENT_JOB_READ,
    Permissions.RECRUITMENT_APPLICATION_READ, Permissions.RECRUITMENT_APPLICATION_UPDATE,
    Permissions.ONBOARDING_TASK_READ, Permissions.ONBOARDING_PROGRESS_UPDATE,
    Permissions.OFFBOARDING_INITIATE, Permissions.OFFBOARDING_TASK_READ, Permissions.OFFBOARDING_PROGRESS_UPDATE,
    Permissions.REPORT_HEADCOUNT, Permissions.REPORT_ATTENDANCE, Permissions.REPORT_LEAVE,
    Permissions.DASHBOARD_READ, Permissions.SETTING_READ
  ],

  MANAGER: [
    Permissions.EMPLOYEE_READ, Permissions.EMPLOYEE_READ_OWN, Permissions.EMPLOYEE_UPDATE_OWN,
    Permissions.DEPARTMENT_READ, Permissions.DESIGNATION_READ,
    Permissions.ATTENDANCE_READ_OWN, Permissions.ATTENDANCE_CLOCK_IN, Permissions.ATTENDANCE_CLOCK_OUT,
    Permissions.LEAVE_APPLY, Permissions.LEAVE_APPROVE, Permissions.LEAVE_REJECT, Permissions.LEAVE_CANCEL,
    Permissions.LEAVE_READ, Permissions.LEAVE_READ_OWN, Permissions.LEAVE_BALANCE_READ_OWN,
    Permissions.PAYROLL_READ_OWN,
    Permissions.REIMBURSEMENT_SUBMIT, Permissions.REIMBURSEMENT_READ_OWN,
    Permissions.PROJECT_READ, Permissions.PROJECT_MEMBER_ADD, Permissions.PROJECT_MEMBER_REMOVE,
    Permissions.TEAM_READ, Permissions.TEAM_MEMBER_ADD, Permissions.TEAM_MEMBER_REMOVE,
    Permissions.PERFORMANCE_REVIEW_CREATE, Permissions.PERFORMANCE_REVIEW_READ, Permissions.PERFORMANCE_REVIEW_READ_OWN,
    Permissions.PERFORMANCE_REVIEW_SUBMIT,
    Permissions.ANNOUNCEMENT_READ,
    Permissions.DOCUMENT_READ_OWN,
    Permissions.DASHBOARD_READ, Permissions.REPORT_ATTENDANCE, Permissions.REPORT_LEAVE
  ],

  TEAM_LEAD: [
    Permissions.EMPLOYEE_READ, Permissions.EMPLOYEE_READ_OWN, Permissions.EMPLOYEE_UPDATE_OWN,
    Permissions.ATTENDANCE_READ_OWN, Permissions.ATTENDANCE_CLOCK_IN, Permissions.ATTENDANCE_CLOCK_OUT,
    Permissions.LEAVE_APPLY, Permissions.LEAVE_CANCEL, Permissions.LEAVE_READ_OWN, Permissions.LEAVE_BALANCE_READ_OWN,
    Permissions.PAYROLL_READ_OWN,
    Permissions.REIMBURSEMENT_SUBMIT, Permissions.REIMBURSEMENT_READ_OWN,
    Permissions.PROJECT_READ,
    Permissions.TEAM_READ,
    Permissions.PERFORMANCE_REVIEW_CREATE, Permissions.PERFORMANCE_REVIEW_READ_OWN, Permissions.PERFORMANCE_REVIEW_SUBMIT,
    Permissions.ANNOUNCEMENT_READ,
    Permissions.DOCUMENT_READ_OWN,
    Permissions.DASHBOARD_READ
  ],

  EMPLOYEE: [
    Permissions.EMPLOYEE_READ_OWN, Permissions.EMPLOYEE_UPDATE_OWN,
    Permissions.ATTENDANCE_READ_OWN, Permissions.ATTENDANCE_CLOCK_IN, Permissions.ATTENDANCE_CLOCK_OUT,
    Permissions.LEAVE_APPLY, Permissions.LEAVE_CANCEL, Permissions.LEAVE_READ_OWN, Permissions.LEAVE_BALANCE_READ_OWN,
    Permissions.PAYROLL_READ_OWN,
    Permissions.REIMBURSEMENT_SUBMIT, Permissions.REIMBURSEMENT_READ_OWN,
    Permissions.PROJECT_READ,
    Permissions.TEAM_READ,
    Permissions.PERFORMANCE_REVIEW_READ_OWN,
    Permissions.ANNOUNCEMENT_READ,
    Permissions.DOCUMENT_READ_OWN,
    Permissions.DASHBOARD_READ
  ]
};
