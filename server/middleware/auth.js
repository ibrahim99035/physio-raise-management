export function requireAuth(req, res, next) {
  return next();
}

export function optionalAuth(req, _res, next) {
  req.user = {
    id: 'single-user',
    name: 'Single User',
    email: 'single@local',
    roles: ['admin']
  };
  return next();
}
