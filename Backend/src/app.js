// backend/src/app.js
const { requireAuth, optionalAuth } = require('./middleware/auth');

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const authPlaceholder = require('./middleware/authPlaceholder');
const config = require('./config');

const app = express();

// middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '5mb' }));

// attach config to req
app.use((req, res, next) => { req.appConfig = config; next(); });

app.use(authPlaceholder);

// static folders
app.use('/reports', express.static(path.resolve(config.REPORTS_DIR)));
app.use('/uploads', express.static(path.resolve(config.UPLOADS_DIR)));

// ======= MOUNT YOUR ROUTES HERE =======
// correct: load the routes from src/routes (your new controllers & services)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/center', require('./routes/center'));
app.use('/api/students', require('./routes/students'));        // <--- now loads src/routes/students.js
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/attendance', require('./routes/attendance_manual'));
app.use('/api/students', require('./routes/students_list'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/diary', require('./routes/diary'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Pravah backend is running' });
});

// global error handler (must be last)
app.use(errorHandler);

module.exports = app;
