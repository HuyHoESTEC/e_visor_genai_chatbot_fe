export const USER_ROLES = {
    ADMIN: 255,
    MANAGER: 127,
    WAREHOUSE_MANAGER: 63,
    EMPLOYEE: 1,
};
// Helper function to get role name
export const getRoleName = (roleId) => {
    switch (roleId) {
        case USER_ROLES.ADMIN: return 'Admin';
        case USER_ROLES.MANAGER: return 'Manager';
        case USER_ROLES.WAREHOUSE_MANAGER: return 'Warehouse Manager';
        case USER_ROLES.EMPLOYEE: return 'Employee';
        default: return 'Guest';
    }
};