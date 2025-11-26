const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const ensureStorageFolders = require('./utils/initStorage');
ensureStorageFolders();


// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const centerRoutes = require('./routes/center');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const attendanceManual = require('./routes/attendance_manual');
const studentsListRoutes = require('./routes/students_list');
const reportsRoutes = require('./routes/reports');
const diaryRoutes = require('./routes/diary');

app.use('/api/auth', authRoutes);
app.use('/api/center', centerRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);  
app.use('/api/attendance', attendanceManual); 
app.use('/api/students', studentsListRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/diary', diaryRoutes);
// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Pravah backend is running' });
});

const PORT = process.env.PORT || 3000;



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

