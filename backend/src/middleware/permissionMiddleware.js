const permissionMiddleware = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      return res.status(401).json({
        success: false,
        message: 'User permissions not available.',
      });
    }

    const userPermissions = req.user.permissions;
    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        requiredPermissions,
        userPermissions,
      });
    }

    next();
  };
};

const canView = (resource) => permissionMiddleware(`view:${resource}`);
const canCreate = (resource) => permissionMiddleware(`create:${resource}`);
const canEdit = (resource) => permissionMiddleware(`edit:${resource}`);
const canDelete = (resource) => permissionMiddleware(`delete:${resource}`);
const canManage = (resource) => permissionMiddleware(
  `view:${resource}`,
  `create:${resource}`,
  `edit:${resource}`,
  `delete:${resource}`
);

module.exports = {
  permissionMiddleware,
  canView,
  canCreate,
  canEdit,
  canDelete,
  canManage,
};