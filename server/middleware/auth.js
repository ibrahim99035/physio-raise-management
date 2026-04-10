export function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return next();
}

export function optionalAuth(req, _res, next) {
  req.user = req.session?.user || null;
  return next();
}
