export const getUserRole = (user) => {
  if (!user) return null;
  return typeof user.role === 'object' ? user.role?.name : user.role;
};

export const isDepartmentHod = (user) => Boolean(user?.isDepartmentHod);

export const hasRoleAccess = (user, allowedRoles = []) => {
  if (!user || !allowedRoles.length) return true;
  const roleName = getUserRole(user);
  return allowedRoles.some((role) => {
    if (role === 'HOD' && isDepartmentHod(user)) return true;
    return role === roleName;
  });
};

export const getDisplayRole = (user) => {
  const roleName = getUserRole(user);
  if (isDepartmentHod(user) && roleName === 'Faculty') return 'HOD';
  return roleName || 'User';
};
