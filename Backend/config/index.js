// Backend/src/config/index.js
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), process.env.NODE_ENV_FILE || '.env') });

const env = process.env;

module.exports = {
  NODE_ENV: env.NODE_ENV || 'development',
  PORT: parseInt(env.PORT, 10) || 3000,
  DATA_DIR: env.DATA_DIR || path.resolve(process.cwd(), 'Backend', 'data'),
  REPORTS_DIR: env.REPORTS_DIR || path.resolve(process.cwd(), 'Backend', 'reports'),
  UPLOADS_DIR: env.UPLOADS_DIR || path.resolve(process.cwd(), 'Backend', 'uploads'),
  JWT_SECRET: env.JWT_SECRET || 'change-me-in-prod',
};
