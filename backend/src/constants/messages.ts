export const Messages = {
  AUTH: {
    REGISTER_SUCCESS: 'User registered successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logged out successfully',
    TOKEN_REFRESH_SUCCESS: 'Token refreshed successfully',
    PASSWORD_RESET_REQUEST_SUCCESS: 'If the email exists, password reset instructions have been sent',
    PASSWORD_RESET_SUCCESS: 'Password has been reset successfully',
    UNAUTHORIZED: 'Authentication required. Please log in.',
    FORBIDDEN: 'Access denied. You do not have permission to access this resource.',
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User account not found',
    USER_INACTIVE: 'User account is inactive. Please contact HR.',
    EMAIL_ALREADY_EXISTS: 'Email address is already registered',
    INVALID_REFRESH_TOKEN: 'Invalid or expired session token',
    INVALID_RESET_TOKEN: 'Password reset token is invalid or has expired',
    MUST_CHANGE_PASSWORD: 'You must change your temporary password before proceeding'
  },

  SYSTEM: {
    HEALTH_CHECK_SUCCESS: 'Database and server are healthy',
    HEALTH_CHECK_FAILED: 'System is unhealthy',
    SERVER_ERROR: 'An internal server error occurred',
    NOT_FOUND: 'Resource not found',
    RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later'
  },

  USER: {
    CREATED: 'User created successfully',
    UPDATED: 'User updated successfully',
    DELETED: 'User deactivated successfully',
    NOT_FOUND: 'User not found',
    LIST_SUCCESS: 'Users retrieved successfully',
    DETAIL_SUCCESS: 'User retrieved successfully',
    STATUS_UPDATED: 'User status updated successfully'
  },

  EMPLOYEE: {
    CREATED: 'Employee created successfully',
    UPDATED: 'Employee updated successfully',
    DELETED: 'Employee deactivated successfully',
    NOT_FOUND: 'Employee not found',
    EMPLOYEE_CODE_EXISTS: 'Employee code already exists',
    USER_ALREADY_LINKED: 'User is already linked to an employee profile',
    USER_NOT_FOUND: 'User not found',
    LIST_SUCCESS: 'Employees retrieved successfully',
    DETAIL_SUCCESS: 'Employee retrieved successfully'
  },

  DEPARTMENT: {
    CREATED: 'Department created successfully',
    UPDATED: 'Department updated successfully',
    DELETED: 'Department deleted successfully',
    NOT_FOUND: 'Department not found',
    NAME_EXISTS: 'Department name already exists',
    CODE_EXISTS: 'Department code already exists',
    LIST_SUCCESS: 'Departments retrieved successfully',
    DETAIL_SUCCESS: 'Department retrieved successfully',
    HAS_EMPLOYEES: 'Cannot delete department with active employees'
  },

  DESIGNATION: {
    CREATED: 'Designation created successfully',
    UPDATED: 'Designation updated successfully',
    DELETED: 'Designation deleted successfully',
    NOT_FOUND: 'Designation not found',
    NAME_EXISTS: 'Designation name already exists',
    CODE_EXISTS: 'Designation code already exists',
    LIST_SUCCESS: 'Designations retrieved successfully',
    DETAIL_SUCCESS: 'Designation retrieved successfully',
    HAS_EMPLOYEES: 'Cannot delete designation with active employees'
  },

  OFFICE_LOCATION: {
    CREATED: 'Office location created successfully',
    UPDATED: 'Office location updated successfully',
    DELETED: 'Office location deleted successfully',
    NOT_FOUND: 'Office location not found',
    CODE_EXISTS: 'Office location code already exists',
    LIST_SUCCESS: 'Office locations retrieved successfully',
    DETAIL_SUCCESS: 'Office location retrieved successfully'
  },

  SHIFT: {
  CREATED: "Shift created successfully",
  UPDATED: "Shift updated successfully",
  DELETED: "Shift deleted successfully",

  LIST_SUCCESS: "Shifts retrieved successfully",
  DETAIL_SUCCESS: "Shift retrieved successfully",

  NOT_FOUND: "Shift not found",

  NAME_EXISTS: "Shift name already exists"
},

  HOLIDAY: {
    CREATED: 'Holiday created successfully',
    UPDATED: 'Holiday updated successfully',
    DELETED: 'Holiday deleted successfully',
    NOT_FOUND: 'Holiday not found',
    LIST_SUCCESS: 'Holidays retrieved successfully',
    DETAIL_SUCCESS: 'Holiday retrieved successfully'
  },

  ATTENDANCE: {
  CHECK_IN: "Checked in successfully",

  CHECK_OUT: "Checked out successfully",

  LIST_SUCCESS: "Attendance retrieved successfully",

  DETAIL_SUCCESS: "Attendance details retrieved successfully",

  ALREADY_CHECKED_IN: "You have already checked in today",

  ALREADY_CHECKED_OUT: "You have already checked out today",

  NOT_FOUND: "Attendance not found"
},

  LEAVE: {
    APPLIED: 'Leave request submitted successfully',
    APPROVED: 'Leave request approved',
    REJECTED: 'Leave request rejected',
    CANCELLED: 'Leave request cancelled',
    UPDATED: "Leave updated successfully",
    WITHDRAWN: 'Leave request withdrawn',
    NOT_FOUND: 'Leave request not found',
    INSUFFICIENT_BALANCE: 'Insufficient leave balance',
    OVERLAPPING: 'Leave request overlaps with existing approved leave',
    CANNOT_CANCEL: 'Cannot cancel a processed leave request',
    CANNOT_APPROVE_OWN: 'Cannot approve your own leave request',
    LIST_SUCCESS: 'Leave requests retrieved successfully',
    DETAIL_SUCCESS: 'Leave request retrieved successfully',
    BALANCE_SUCCESS: 'Leave balances retrieved successfully',
    TYPE_CREATED: 'Leave type created successfully',
    TYPE_UPDATED: 'Leave type updated successfully',
    TYPE_DELETED: 'Leave type deleted successfully',
    TYPE_NOT_FOUND: 'Leave type not found',
    TYPE_LIST_SUCCESS: 'Leave types retrieved successfully'
  },

  PAYROLL: {
    GENERATED: 'Payroll generated successfully',
    UPDATED: 'Payroll updated successfully',
    APPROVED: 'Payroll approved successfully',
    PAID: 'Payroll marked as paid',
    CANCELLED: 'Payroll cancelled',
    NOT_FOUND: 'Payroll record not found',
    ALREADY_EXISTS: 'Payroll already exists for this employee and period',
    CANNOT_EDIT: 'Cannot edit approved or paid payroll',
    LIST_SUCCESS: 'Payroll records retrieved successfully',
    DETAIL_SUCCESS: 'Payroll record retrieved successfully'
  },

  SALARY_COMPONENT: {
    CREATED: 'Salary component created successfully',
    UPDATED: 'Salary component updated successfully',
    DELETED: 'Salary component deleted successfully',
    NOT_FOUND: 'Salary component not found',
    CODE_EXISTS: 'Salary component code already exists',
    NAME_EXISTS: 'Salary component name already exists',
    LIST_SUCCESS: 'Salary components retrieved successfully',
    DETAIL_SUCCESS: 'Salary component retrieved successfully'
  },

  REIMBURSEMENT: {
    SUBMITTED: 'Reimbursement request submitted successfully',
    UPDATED: 'Reimbursement updated successfully',
    APPROVED: 'Reimbursement approved',
    REJECTED: 'Reimbursement rejected',
    PAID: 'Reimbursement marked as paid',
    DELETED: 'Reimbursement deleted',
    NOT_FOUND: 'Reimbursement not found',
    CANNOT_EDIT: 'Cannot edit a processed reimbursement',
    LIST_SUCCESS: 'Reimbursements retrieved successfully',
    DETAIL_SUCCESS: 'Reimbursement retrieved successfully'
  },

  ASSET: {
    CREATED: 'Asset created successfully',
    UPDATED: 'Asset updated successfully',
    DELETED: 'Asset deleted successfully',
    NOT_FOUND: 'Asset not found',
    CODE_EXISTS: 'Asset code already exists',
    ASSIGNED: 'Asset assigned successfully',
    RETURNED: 'Asset returned successfully',
    NOT_AVAILABLE: 'Asset is not available for assignment',
    NOT_ASSIGNED: 'Asset is not currently assigned to this employee',
    LIST_SUCCESS: 'Assets retrieved successfully',
    DETAIL_SUCCESS: 'Asset retrieved successfully'
  },

  PROJECT: {
    CREATED: 'Project created successfully',
    UPDATED: 'Project updated successfully',
    DELETED: 'Project deleted successfully',
    NOT_FOUND: 'Project not found',
    CODE_EXISTS: 'Project code already exists',
    MEMBER_ADDED: 'Member added to project',
    MEMBER_REMOVED: 'Member removed from project',
    ALREADY_MEMBER: 'Employee is already a member of this project',
    NOT_MEMBER: 'Employee is not a member of this project',
    LIST_SUCCESS: 'Projects retrieved successfully',
    DETAIL_SUCCESS: 'Project retrieved successfully'
  },

  TEAM: {
    CREATED: 'Team created successfully',
    UPDATED: 'Team updated successfully',
    DELETED: 'Team deleted successfully',
    NOT_FOUND: 'Team not found',
    CODE_EXISTS: 'Team code already exists',
    MEMBER_ADDED: 'Member added to team',
    MEMBER_REMOVED: 'Member removed from team',
    ALREADY_MEMBER: 'Employee is already a member of this team',
    NOT_MEMBER: 'Employee is not a member of this team',
    LIST_SUCCESS: 'Teams retrieved successfully',
    DETAIL_SUCCESS: 'Team retrieved successfully'
  },

  PERFORMANCE: {
    CYCLE_CREATED: 'Performance cycle created successfully',
    CYCLE_UPDATED: 'Performance cycle updated successfully',
    CYCLE_DELETED: 'Performance cycle deleted',
    CYCLE_NOT_FOUND: 'Performance cycle not found',
    CYCLE_LIST_SUCCESS: 'Performance cycles retrieved successfully',
    REVIEW_CREATED: 'Performance review created successfully',
    REVIEW_UPDATED: 'Performance review updated successfully',
    REVIEW_SUBMITTED: 'Performance review submitted successfully',
    REVIEW_NOT_FOUND: 'Performance review not found',
    REVIEW_LIST_SUCCESS: 'Performance reviews retrieved successfully',
    ALREADY_REVIEWED: 'Review already exists for this employee in this cycle',
    CANNOT_REVIEW_SELF: 'Cannot submit a review for yourself'
  },

  ANNOUNCEMENT: {
    CREATED: 'Announcement created successfully',
    UPDATED: 'Announcement updated successfully',
    DELETED: 'Announcement deleted successfully',
    PUBLISHED: 'Announcement published',
    NOT_FOUND: 'Announcement not found',
    LIST_SUCCESS: 'Announcements retrieved successfully',
    DETAIL_SUCCESS: 'Announcement retrieved successfully'
  },

  NOTIFICATION: {
    LIST_SUCCESS: 'Notifications retrieved successfully',
    MARKED_READ: 'Notification marked as read',
    ALL_MARKED_READ: 'All notifications marked as read',
    NOT_FOUND: 'Notification not found',
    DELETED: 'Notification deleted'
  },

  DOCUMENT: {
    CREATED: 'Document uploaded successfully',
    UPDATED: 'Document updated successfully',
    DELETED: 'Document deleted successfully',
    NOT_FOUND: 'Document not found',
    VERIFIED: 'Document verified',
    LIST_SUCCESS: 'Documents retrieved successfully',
    DETAIL_SUCCESS: 'Document retrieved successfully'
  },

  RECRUITMENT: {
    JOB_CREATED: 'Job posting created successfully',
    JOB_UPDATED: 'Job posting updated successfully',
    JOB_DELETED: 'Job posting deleted',
    JOB_NOT_FOUND: 'Job posting not found',
    JOB_LIST_SUCCESS: 'Job postings retrieved successfully',
    APPLICATION_SUBMITTED: 'Application submitted successfully',
    APPLICATION_UPDATED: 'Application updated successfully',
    APPLICATION_NOT_FOUND: 'Application not found',
    APPLICATION_LIST_SUCCESS: 'Applications retrieved successfully',
    DUPLICATE_APPLICATION: 'Candidate has already applied for this position'
  },

  ONBOARDING: {
    TASK_CREATED: 'Onboarding task created successfully',
    TASK_UPDATED: 'Onboarding task updated successfully',
    TASK_DELETED: 'Onboarding task deleted',
    TASK_NOT_FOUND: 'Onboarding task not found',
    TASK_LIST_SUCCESS: 'Onboarding tasks retrieved successfully',
    PROGRESS_UPDATED: 'Onboarding progress updated',
    PROGRESS_LIST_SUCCESS: 'Onboarding progress retrieved successfully',
    INITIALIZED: 'Onboarding tasks initialized for employee'
  },

  OFFBOARDING: {
    INITIATED: 'Offboarding process initiated',
    TASK_CREATED: 'Offboarding task created successfully',
    TASK_UPDATED: 'Offboarding task updated',
    TASK_NOT_FOUND: 'Offboarding task not found',
    TASK_LIST_SUCCESS: 'Offboarding tasks retrieved successfully',
    PROGRESS_UPDATED: 'Offboarding progress updated',
    COMPLETED: 'Offboarding process completed'
  },

  REPORT: {
    GENERATED: 'Report generated successfully'
  },

  DASHBOARD: {
    SUCCESS: 'Dashboard data retrieved successfully'
  },

  AUDIT_LOG: {
    LIST_SUCCESS: 'Audit logs retrieved successfully'
  },

  SETTING: {
    LIST_SUCCESS: 'Settings retrieved successfully',
    UPDATED: 'Setting updated successfully',
    NOT_FOUND: 'Setting not found',
    NOT_EDITABLE: 'This setting cannot be modified'
  },

  PERMISSION: {
    LIST_SUCCESS: 'Permissions retrieved successfully',
    UPDATED: 'Role permissions updated successfully',
    NOT_FOUND: 'Permission not found'
  }
} as const;
