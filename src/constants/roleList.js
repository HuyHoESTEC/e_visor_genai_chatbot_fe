export const USER_ROLES = {
    ADMIN: 255,
    DIRECTOR: 127,
    PROJECT_MANAGER: 1,
    EMPLOYEE: 2,
};
// Helper function to get role name
export const getRoleName = (roleId) => {
    switch (roleId) {
        case USER_ROLES.ADMIN: return 'Admin';
        case USER_ROLES.DIRECTOR: return 'Director/Manage';
        case USER_ROLES.PROJECT_MANAGER: return 'Project Manager';
        case USER_ROLES.EMPLOYEE: return 'Employee';
        default: return 'Guest';
    }
};