# Samarth College ERP System

## Educational ERP System for Samarth Rural Educational Institute
### SAMARTH COLLEGE OF ENGINEERING & MANAGEMENT, BELHE

A comprehensive full-stack Educational ERP System with centralized platform for managing academic, administrative, and financial operations.

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
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context (Auth)
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── App.js        # Main app component
│   │   └── index.css     # Global styles
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

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

### Frontend Setup

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

## 📱 Screenshots

The application features:
- Modern landing page with carousel
- Role-based dashboards
- Responsive design for all devices
- Real-time notifications
- Interactive charts and analytics

---

## 📄 License

This project is proprietary software for Samarth Rural Educational Institute.

---

## 👨‍💻 Developer

Built with ❤️ for Samarth College of Engineering & Management, Belhe

---

## 🤝 Support

For support, email: support@samarthcollege.edu.in
