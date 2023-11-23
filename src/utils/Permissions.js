export function checkPermission(requiredPermission) {
    // Retrieve userPermissions from localStorage
    const storedPermissions = JSON.parse(localStorage.getItem('user')) || [];

    // Check if the requiredPermission exists in storedPermissions
    return storedPermissions?.role?.permissions?.includes(requiredPermission);
}

export function isSuperAdmin(role){
    const storedPermissions = JSON.parse(localStorage.getItem('user')) || [];

        return storedPermissions?.role?.name?.includes(role);
  };