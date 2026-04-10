export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    return next();
  };
}
