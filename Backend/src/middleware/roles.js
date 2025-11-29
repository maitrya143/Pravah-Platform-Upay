// backend/src/middleware/roles.js
/**
 * Simplified RBAC for prototype:
 * - centerHead is treated as super-user (always allowed)
 * - admin is also allowed where required
 *
 * Export:
 *  - requireRole(...allowedRoles) -> Express middleware
 *  - hasRole(user, roles) -> boolean helper
 */

function hasRole(user, roles) {
    if (!user) return false;
    const r = (user.role || '').toString();
    if (!roles || roles.length === 0) return false;
    // centerHead is super-user in prototype
    if (r === 'centerHead') return true;
    return roles.includes(r);
  }
  
  function requireRole(...allowedRoles) {
    return function (req, res, next) {
      const user = req.user;
      if (!user) return res.status(401).json({ error: 'missing_auth' });
      // centerHead always allowed (prototype policy)
      if (user.role === 'centerHead') return next();
      if (!allowedRoles || allowedRoles.length === 0) return next();
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'forbidden', reason: `requires one of [${allowedRoles.join(',')}]` });
      }
      return next();
    };
  }
  
  module.exports = { requireRole, hasRole };
  