function requireAdmin(req, res, next) {
  const role = req.headers['x-user-role'];
  if (role !== 'tany-admin') {
    return res.status(403).json({ error: 'Se requieren permisos de administrador' });
  }
  next();
}

module.exports = requireAdmin;
