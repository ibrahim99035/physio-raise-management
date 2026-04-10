export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const user = req.session?.user;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const roles = Array.isArray(user.roles) ? user.roles : [];
    const hasRole = allowedRoles.some((role) => roles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
}
