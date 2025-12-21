export function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    // el role debe venir desde auth/login y viajar en el request
    const role = req.user?.role;

    if (!role) {
      return res.status(401).json({ error: "No autenticado" });
    }

    if (!rolesPermitidos.includes(role)) {
      return res.status(403).json({ error: "Permisos insuficientes" });
    }

    next();
  };
}
