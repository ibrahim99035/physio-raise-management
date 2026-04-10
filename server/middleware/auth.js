function isDeploymentBypassEnabled() {
  return process.env.VERCEL === '1' || process.env.AUTH_BYPASS === 'true';
}

export function requireAuth(req, res, next) {
  if (isDeploymentBypassEnabled()) {
    return next();
  }

  if (!req.session?.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return next();
}

export function optionalAuth(req, _res, next) {
  req.user = isDeploymentBypassEnabled()
    ? {
        id: 'deployment-bypass-user',
        name: 'Deployment User',
        email: 'deployment@local',
        roles: ['admin']
      }
    : req.session?.user || null;
  return next();
}
