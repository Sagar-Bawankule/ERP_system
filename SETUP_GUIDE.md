# 🚀 Complete Setup Guide for College ERP System

This guide provides step-by-step instructions to set up the College ERP System on a new device from the GitHub repository.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Minimum Version | Download Link |
|------|-----------------|---------------|
| **Node.js** | v16.0+ | [nodejs.org](https://nodejs.org/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |
| **npm** | v8.0+ | Comes with Node.js |
| **MongoDB Atlas Account** | - | [mongodb.com/atlas](https://www.mongodb.com/atlas) |

> [!TIP]
> Verify installations by running: `node -v`, `npm -v`, `git --version`

---

## 📥 Step 1: Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/road2tec/College-ERP-System-Mern.git
```

Navigate into the project folder:

```bash
cd College-ERP-System-Mern
```

---

## ⚙️ Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Install Dependencies

```bash
npm install
```

### 2.3 Create Environment File

Create a `.env` file in the `backend` folder:

**On Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**On Mac/Linux:**
```bash
cp .env.example .env
```

### 2.4 Configure Environment Variables

Open the `.env` file and update with your credentials:

```env
# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/erp_system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRE=30d

# Server Configuration
NODE_ENV=development
PORT=5000

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

> [!IMPORTANT]
> **How to get MongoDB Atlas connection string:**
> 1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
> 2. Create a free cluster (or use existing)
> 3. Click **Connect** → **Connect your application**
> 4. Copy the connection string
> 5. Replace `<username>`, `<password>` with your database user credentials

> [!TIP]
> **How to get Cloudinary credentials:**
> 1. Go to [Cloudinary](https://cloudinary.com/)
> 2. Create a free account
> 3. Go to **Dashboard** → Copy Cloud Name, API Key, and API Secret

### 2.5 Seed Initial Data (Optional)

To add sample data to your database:

```bash
cd seeders
node seedData.js
cd ..
```

### 2.6 Start Backend Server

```bash
npm start
```

✅ You should see:
```
☁️  Cloudinary configured
✅ MongoDB Connected
🚀 Server running on port 5000
```

---

## 🎨 Step 3: Frontend Setup

Open a **new terminal** (keep backend running):

### 3.1 Navigate to Frontend Directory

```bash
cd frontend
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Start Frontend Server

```bash
npm start
```

✅ The browser will automatically open at: **http://localhost:3000**

---

## 🔐 Step 4: Default Login Credentials

After seeding the database, you can use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@college.edu | admin123 |
| Teacher | teacher@college.edu | teacher123 |
| Student | student@college.edu | student123 |
| Parent | parent@college.edu | parent123 |

> [!NOTE]
> If you didn't run the seeder, create an admin account using the registration API or MongoDB Compass.

---

## 📱 Step 5: Mobile App (Optional)

To build the Android mobile app:

### 5.1 Prerequisites
- Android Studio installed
- JDK 11 or higher

### 5.2 Build Commands

```bash
cd frontend
npm run build:mobile
npm run open:android
```

### 5.3 In Android Studio
- **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**

See [MOBILE_APP_GUIDE.md](./MOBILE_APP_GUIDE.md) for detailed instructions.

---

## 🧪 Step 6: Verify Installation

Run this checklist to ensure everything works:

- [ ] Backend server running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can login with admin credentials
- [ ] Dashboard loads without errors

---

## 🔧 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **MongoDB connection failed** | Check your `MONGODB_URI` credentials and IP whitelist in Atlas |
| **Port already in use** | Kill the process using the port or change PORT in `.env` |
| **npm install fails** | Delete `node_modules` and `package-lock.json`, then run `npm install` again |
| **Login fails** | Ensure both frontend and backend are running |
| **Cloudinary errors** | Verify Cloudinary credentials in `.env` |

### Useful Commands

```bash
# Check if Node.js is installed
node -v

# Check if MongoDB is accessible
# (In MongoDB Compass, try connecting to your Atlas cluster)

# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 5000 (Mac/Linux)
lsof -i :5000
kill -9 <PID>
```

---

## 📁 Project Structure Overview

```
College-ERP-System-Mern/
├── backend/               # Node.js + Express API
│   ├── config/            # Database & Cloudinary config
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth, error handling
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── seeders/           # Sample data
│   ├── .env.example       # Environment template
│   └── server.js          # Entry point
│
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── context/       # Auth context
│   └── android/           # Capacitor Android app
│
└── SETUP_GUIDE.md         # This file
```

---

## 🚀 Quick Start Commands Summary

```bash
# 1. Clone repository
git clone https://github.com/road2tec/College-ERP-System-Mern.git
cd College-ERP-System-Mern

# 2. Setup Backend
cd backend
npm install
# Create and configure .env file (see Step 2.4)
npm start

# 3. Setup Frontend (new terminal)
cd frontend
npm install
npm start
```

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the error logs in terminal
3. Contact: support@samarthcollege.edu.in

---

**Happy Coding! 🎉**
