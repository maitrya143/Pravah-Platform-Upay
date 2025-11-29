// Backend/src/middleware/errorHandler.js
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
    console.error(err && err.stack ? err.stack : err);
  
    const status = err.statusCode || err.status || 500;
    const body = {
      success: false,
      error: err.message || 'Internal server error'
    };
  
    if (process.env.NODE_ENV !== 'production') {
      body.debug = {
        name: err.name,
        stack: err.stack
      };
    }
  
    res.status(status).json(body);
  }
  
  module.exports = errorHandler;
  