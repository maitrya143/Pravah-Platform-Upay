# Pravah Prototype - Complete Summary

## Project Overview

Pravah is a comprehensive education management system prototype designed to streamline operations for educational centers. The system focuses on managing student attendance, admissions, diaries, syllabus, performance tracking, and feedback collection. This prototype is specifically designed for **Center Head** role, serving as the primary user interface for center-level operations.

## User Role

- **Center Head Only** (for prototype)
  - Single user role with full administrative access to center operations
  - Responsible for all center-level activities including attendance marking, admissions, and data management

## Login Flow

1. User accesses the login page
2. Enters credentials (username/password)
3. System authenticates and validates user
4. Upon successful authentication, user is redirected to center selection (if multiple centers) or directly to dashboard

## Center Selection

- After login, center head selects their assigned center from available centers
- Center selection determines the scope of all subsequent operations
- All modules operate within the context of the selected center

## Dashboard Layout

The dashboard serves as the central hub displaying:
- Quick statistics and overview metrics
- Navigation to all major modules
- Recent activities and notifications
- Center-specific information and status

## Attendance Module

### QR Code Attendance
- Generate QR codes for students
- Students scan QR codes to mark attendance
- Real-time attendance tracking
- Automatic timestamp recording

### Manual Attendance
- Center head can manually mark attendance for students
- Fallback option when QR scanning is unavailable
- Supports bulk attendance marking
- Edit/correct attendance records

## UPAY Diary Module

### Center Section
- Center-level diary entries and notes
- Document important center activities
- Track center-specific events and milestones
- Maintain center-level records

### Volunteer Section
- Volunteer-specific diary entries
- Track volunteer activities and contributions
- Maintain volunteer engagement records
- Document volunteer feedback and observations

## New Admission Flow

1. **Hard-copy Form Scan**
   - Center head scans the physical admission form
   - System stores the scanned document as PDF
   - PDF is linked to the student record

2. **QR Generation**
   - After form submission, system automatically generates a unique QR code for the new student
   - QR code is associated with the student's profile
   - QR code can be printed or shared digitally for attendance purposes

3. **Data Entry**
   - Student information is entered into the system
   - All required fields are validated
   - Admission is finalized and student is added to the center roster

## History Module

- View historical records of all activities
- Track changes and modifications
- Access past attendance records
- Review admission history
- View diary entries chronologically
- Filter and search historical data

## Syllabus Module

- Upload and manage syllabus documents
- Organize syllabus by classes/subjects
- View and download syllabus materials
- Update syllabus versions
- Track syllabus changes over time

## Center Performance Module

- View center-level performance metrics
- Track attendance statistics
- Monitor student enrollment trends
- Analyze center activity patterns
- Generate performance reports
- Compare performance across time periods

## Feedback Module

- Collect feedback from various stakeholders
- Submit and manage feedback entries
- Track feedback responses
- View feedback history
- Categorize feedback by type/priority

## Logout

- Secure logout functionality
- Session termination
- Redirect to login page
- Clear user session data

## Tech Stack

### Frontend
- **React** - UI framework for building interactive user interfaces
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for styling

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web application framework

### Database
- **PostgreSQL** - Relational database management system
- **Prisma** - ORM for database access and migrations

### Services
- **Supabase** - Backend-as-a-Service for authentication, database, and storage

### Libraries
- **QR Code Libraries** - For generating and scanning QR codes
- **PDF Libraries** - For handling PDF generation, manipulation, and storage

## Folder Structure

```
pravah/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── attendance.js
│   │   │   ├── auth.js
│   │   │   └── students.js
│   │   ├── scripts/
│   │   │   └── seed.js
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── Login.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── routes.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── db/
│   ├── schema.prisma
│   └── seed/
│       └── README.md
├── infra/
│   ├── backend.Dockerfile
│   ├── docker-compose.yml
│   └── frontend.Dockerfile
├── mobile/
│   ├── App.js
│   ├── app.json
│   ├── package.json
│   └── README.md
└── notes.md
```

## Rules

1. **Center Head Attendance Marking**
   - Only center head can mark attendance for students
   - Attendance can be marked via QR code scanning or manual entry
   - Attendance records are timestamped and cannot be modified after a certain period

2. **PDF Storage**
   - All scanned admission forms must be stored as PDF files
   - PDFs are linked to student records in the database
   - PDF storage is managed through Supabase storage or similar service

3. **Admission Scan Requirement**
   - Hard-copy admission form scan is mandatory for new admissions
   - System will not complete admission process without scanned form
   - Scanned form must be in PDF format

4. **QR Code Generation**
   - QR codes are automatically generated upon successful admission
   - Each student has a unique QR code
   - QR codes are used exclusively for attendance purposes

5. **Center Context**
   - All operations are scoped to the selected center
   - Data isolation between different centers
   - Center head can only access their assigned center's data

## Placeholder Image

Image path: `/mnt/data/A_flat-style_digital_illustration_depicts_three_st.png`

## TODO List

### High Priority
- [ ] Implement complete authentication flow with Supabase
- [ ] Set up PostgreSQL database schema with Prisma
- [ ] Build QR code generation and scanning functionality
- [ ] Implement PDF upload and storage system
- [ ] Create attendance marking interface (QR + manual)
- [ ] Develop new admission flow with form scanning
- [ ] Build UPAY diary module (center + volunteer sections)

### Medium Priority
- [ ] Design and implement dashboard layout
- [ ] Create history module with filtering and search
- [ ] Build syllabus module with document management
- [ ] Develop center performance module with analytics
- [ ] Implement feedback module
- [ ] Add logout functionality with session management

### Low Priority
- [ ] Add data export functionality
- [ ] Implement notification system
- [ ] Create admin panel for system configuration
- [ ] Add multi-language support
- [ ] Implement data backup and recovery
- [ ] Add audit logging for all operations
- [ ] Create mobile app version
- [ ] Implement offline mode capabilities
- [ ] Add advanced reporting features
- [ ] Create user documentation and help guides

### Technical Debt
- [ ] Set up CI/CD pipeline
- [ ] Add comprehensive error handling
- [ ] Implement input validation and sanitization
- [ ] Add unit and integration tests
- [ ] Optimize database queries
- [ ] Implement caching strategies
- [ ] Add API rate limiting
- [ ] Set up monitoring and logging
- [ ] Implement security best practices
- [ ] Add code documentation

Pravah Prototype Status Update:
- Backend installed and running properly on port 3000.
- volunteer_roster.json is created with 4 center heads.
- Next tasks to build:
  1. POST /auth/login (JWT-based)
  2. GET /center/list (based on volunteer_id)
  3. Frontend login page
  4. Center selection page
