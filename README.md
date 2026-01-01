# Samarth College ERP System

## Educational ERP System for Samarth Rural Educational Institute
### SAMARTH COLLEGE OF ENGINEERING & MANAGEMENT, BELHE

A comprehensive full-stack Educational ERP System with centralized platform for managing academic, administrative, and financial operations.

> **📱 Now Available as Mobile App!** - Android APK ready for download. See [Mobile App Guide](#-mobile-app) below.

---

## 🌟 Features

### User Roles
- **Admin** - Complete system management, analytics, and reporting
- **Teacher** - Attendance marking, marks entry, notes upload
- **Student** - View attendance, fees, marks, download notes
- **Parent** - Monitor ward's academic progress

### Core Modules
- 📊 **Dashboard** - Role-based dashboards with analytics
- 📅 **Attendance Management** - Mark and track attendance
- 💰 **Fee Management** - Fee structures, payments, receipts
- 📚 **Marks & Results** - Enter marks, view results, backlogs
- 📝 **Notes/Study Materials** - Upload and download resources
- 🏆 **Scholarships** - Manage and apply for scholarships
- 📋 **Leave Applications** - Apply and approve leaves
- 🖼️ **College Gallery** - Manage campus images

---

## 🛠️ Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- Role-Based Access Control (RBAC)
- Multer for file uploads
- PDFKit for receipt generation

### Frontend
- React 18
- React Router v6
- Chart.js for analytics
- React Toastify for notifications
- Modern CSS with CSS Variables
- **Capacitor 8** - Native mobile app support

---

## 📁 Project Structure

```
ERP_system/
├── backend/
│   ├── config/           # Database & Cloudinary config
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Auth, error handling, uploads
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── seeders/          # Database seeders
│   ├── uploads/          # Uploaded files
│   ├── server.js         # Express server
│   └── package.json
│
├── frontend/
│   ├── android/          # Android mobile app (Capacitor)
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context (Auth)
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── App.js        # Main app component
│   │   └── index.css     # Global styles
│   ├── capacitor.config.ts
│   └── package.json
│
├── MOBILE_APP_GUIDE.md   # Mobile app build instructions
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- **For Mobile App**: Android Studio + JDK 11+

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ERP_system
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

4. Seed the database (optional):
```bash
cd seeders
node seedData.js
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup (Web)

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The web app will open at `http://localhost:3000`

---

## 📱 Mobile App

### Quick Start

The ERP system is now available as a native Android mobile app!

**Build Mobile App**:
```bash
cd frontend
npm run build:mobile
npm run open:android
```

Then build APK in Android Studio:
- **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**

### Complete Guide

For detailed instructions on building, configuring, and deploying the mobile app, see:

📖 **[MOBILE_APP_GUIDE.md](./MOBILE_APP_GUIDE.md)**

The guide covers:
- Setting up Android Studio
- Configuring backend URL (ngrok or deployed server)
- Building APK for testing
- Signing APK for Play Store
- Troubleshooting common issues
- Complete testing checklist

### Mobile App Features

The mobile app includes **all web features**:
- ✅ Same backend and database
- ✅ All user roles (Admin, Teacher, Student, Parent)
- ✅ All dashboards and functionality
- ✅ File upload/download
- ✅ Responsive mobile UI
- ✅ Native performance

**App Details**:
- **Package ID**: `com.samarthcollege.erp`
- **Name**: Samarth College ERP
- **Platform**: Android (iOS can be added)
- **Min SDK**: Android 5.0 (API 21)

---

## 🔐 Demo Credentials

| Role    | Email                            | Password    |
|---------|----------------------------------|-------------|
| Admin   | admin@samarthcollege.edu.in      | admin123    |
| Teacher | teacher1@samarthcollege.edu.in   | teacher123  |
| Student | student1@samarthcollege.edu.in   | student123  |
| Parent  | parent1@gmail.com                | parent123   |

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create student
- `GET /api/students/:id` - Get student by ID

### Teachers
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Create teacher

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/student/:id` - Get student attendance

### Fees
- `GET /api/fees/structures` - Get fee structures
- `POST /api/fees/payment` - Make payment

### And many more...

---

## 📱 Platform Availability

| Platform | Status | Link |
|----------|--------|------|
| 🌐 Web App | ✅ Live | `http://localhost:3000` |
| 📱 Android App | ✅ Ready | Build APK (see guide) |
| 🍎 iOS App | 🔜 Coming Soon | Requires Mac + Xcode |

---

## 🚀 Deployment

### Web Application
- Frontend: Deploy to Vercel, Netlify, or Render
- Backend: Deploy to Render, Railway, or Heroku
- Database: MongoDB Atlas (recommended)

### Mobile Application
- Build signed APK using Android Studio
- Upload to Google Play Store
- Follow Play Store publishing guidelines

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 📄 License

This project is proprietary software for Samarth Rural Educational Institute.

---

## 👨‍💻 Developer

Built with ❤️ for Samarth College of Engineering & Management, Belhe

---

## 🤝 Support

For support, email: support@samarthcollege.edu.in

---

## 📚 Additional Documentation

- [MOBILE_APP_GUIDE.md](./MOBILE_APP_GUIDE.md) - Mobile app setup and build instructions
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment instructions

---

**⭐ Star this repository if you find it helpful!**
