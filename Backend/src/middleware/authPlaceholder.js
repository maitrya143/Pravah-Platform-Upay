// Backend/src/middleware/authPlaceholder.js
// Very small placeholder. Replace with real JWT verification later.
function authPlaceholder(req, res, next) {
    // For dev only: set a fake user if Authorization header present
    const auth = req.header('Authorization');
    if (!auth) {
      // Not authenticated, proceed as anonymous (or you can reject)
      req.user = null;
      return next();
    }
  
    // Very small parsing: "Bearer <username>"
    const parts = auth.split(' ');
    if (parts[0] === 'Bearer' && parts[1]) {
      req.user = { id: parts[1], role: 'centerHead' }; // dev stub
    } else {
      req.user = { id: 'dev-user', role: 'centerHead' };
    }
    return next();
  }
  
  module.exports = authPlaceholder;
  