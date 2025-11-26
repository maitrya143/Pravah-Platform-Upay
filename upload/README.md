# Pravah - Flow Of Change

A comprehensive education management system prototype designed to streamline operations for educational centers, focusing on student attendance, admissions, diaries, syllabus, performance tracking, and feedback collection.

## Features

- **Authentication & Authorization** - Secure login system with center head role
- **Center Management** - Select and manage educational centers
- **Attendance Tracking** - QR code and manual attendance marking
- **UPAY Diary** - Center and volunteer diary entries
- **New Admissions** - Form scanning and QR code generation for new students
- **History** - Comprehensive activity and record history
- **Syllabus Management** - Upload and organize syllabus documents
- **Performance Analytics** - Center-level performance metrics and reports
- **Feedback System** - Collect and manage stakeholder feedback
- **Dashboard** - Central hub for all operations and quick statistics

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Services**: Supabase (authentication, database, storage)
- **Libraries**: QR code generation/scanning, PDF handling

## Installation

### Environment Setup

1. Copy the environment example file in the backend directory:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Update the `.env` file with your actual configuration values (database URL, JWT secret, Supabase credentials, etc.)

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend server will start on port 4000 (or the port specified in your `.env` file).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend development server will start on port 3000.

### Mobile App

```bash
cd mobile
npm install
npm start
```

This will start the Expo development server. Use the Expo Go app on your mobile device to scan the QR code and run the app.

