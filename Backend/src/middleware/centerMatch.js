// backend/src/middleware/centerMatch.js
module.exports = function requireCenterMatch(req, res, next) {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'missing_auth' });
    if (user.role === 'admin' || user.role === 'centerHead') return next(); // centerHead allowed as proto-superuser
    const targetCenter = req.body.center_id || req.body.centerId || req.params.centerId || req.query.center || req.query.center_id;
    if (!targetCenter) return res.status(400).json({ error: 'center_id_required' });
    if (String(user.center_id) !== String(targetCenter)) return res.status(403).json({ error: 'forbidden_center_mismatch' });
    return next();
  };
  