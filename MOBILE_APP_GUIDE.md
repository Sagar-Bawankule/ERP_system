# 📱 Mobile App Setup Guide

## Samarth College ERP System - Android Mobile App

This guide explains how to build and deploy the Android mobile app for the Samarth College ERP System.

---

## ✅ Prerequisites

Before starting, ensure you have:

1. **Node.js** (v16+) - Already installed ✅
2. **Android Studio** - [Download here](https://developer.android.com/studio)
3. **Java Development Kit (JDK)** 11 or higher
4. **Backend Server** - Must be accessible from the mobile device

---

## 📦 What We've Done

### Phase 1: Capacitor Setup ✅
- ✅ Installed Capacitor CLI and Android platform
- ✅ Initialized Capacitor project with app ID: `com.samarthcollege.erp`
- ✅ Created Android native project

### Phase 2: Frontend Configuration ✅
- ✅ Added mobile build scripts to `package.json`
- ✅ Updated CORS in backend to allow mobile requests
- ✅ Created `.env.production` for API URL configuration
- ✅ Enhanced `index.html` with mobile-optimized meta tags

### Phase 3: Mobile Features ✅
- ✅ Added professional app icon (512x512px)
- ✅ Added splash screen (2732x2732px)
- ✅ Configured mobile-specific permissions
- ✅ Updated Capacitor config for Android settings

### Phase 4: Build ✅
- ✅ Built production React bundle
- ✅ Synced web assets to Android project

---

## 🚀 Next Steps: Building the APK

### Step 1: Setup Backend URL

**IMPORTANT**: Before building the APK, you need to configure where the app will connect to your backend.

#### Option A: Using ngrok (Recommended for Testing)

1. **Install ngrok**: Download from [ngrok.com](https://ngrok.com/)

2. **Start your backend**:
   ```bash
   cd e:\ERP_system\backend
   npm start
   ```

3. **In a new terminal, run ngrok**:
   ```bash
   ngrok http 5000
   ```

4. **Copy the HTTPS URL** (looks like: `https://abc123.ngrok.io`)

5. **Update frontend/.env.production**:
   ```env
   REACT_APP_API_URL=https://abc123.ngrok.io/api
   ```

6. **Rebuild**:
   ```bash
   cd e:\ERP_system\frontend
   npm run build
   npx cap sync android
   ```

#### Option B: Deploy Backend (For Production)

Deploy your backend to a cloud service:
- **Render** (Free tier): https://render.com
- **Railway**: https://railway.app
- **Heroku**: https://heroku.com

Then update `.env.production` with your deployed URL.

---

### Step 2: Open Android Studio

```bash
cd e:\ERP_system\frontend
npm run open:android
```

This will open Android Studio with your Android project.

---

### Step 3: Build APK in Android Studio

1. **Wait for Gradle sync** to complete (first time may take 5-10 minutes)

2. **Select Build Variant**:
   - Click **Build** → **Select Build Variant**
   - Choose **release** (for production APK)

3. **Build APK**:
   - Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - Wait for build to complete

4. **Locate APK**:
   - APK will be at: `e:\ERP_system\frontend\android\app\build\outputs\apk\release\app-release.apk`
   - Or click **locate** link in the notification

---

### Step 4: Install & Test

#### On Physical Android Device:

1. **Enable Developer Options**:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back → Developer Options → Enable "USB Debugging"

2. **Connect device via USB**

3. **Install APK**:
   - Transfer APK to phone
   - Open file and install
   - Or use ADB: `adb install app-release.apk`

#### On Android Emulator:

1. **In Android Studio**:
   - Click **Device Manager**
   - Create a virtual device (e.g., Pixel 5)
   - Start the emulator

2. **Run app**:
   - Click the **Run** button (green play icon)
   - Or drag APK into emulator window

---

## 📝 Important Notes

### Backend Connection

- **Development**: Use ngrok for testing
- **Production**: Deploy backend to a public server
- **Local Network**: Use your computer's IP address (e.g., `http://192.168.1.100:5000/api`)

### Updating the App

Whenever you make changes to your React code:

```bash
# 1. Make your code changes
# 2. Rebuild and sync
cd e:\ERP_system\frontend
npm run build:mobile

# 3. Open in Android Studio and rebuild APK
npm run open:android
```

### Quick Build Command

We've added a convenient script:

```bash
npm run build:mobile
```

This builds the React app AND syncs with Capacitor in one command!

---

## 🎯 Scripts Added

| Script | Command | Description |
|--------|---------|-------------|
| `build:mobile` | `react-scripts build && npx cap sync` | Build and sync in one step |
| `sync:android` | `npx cap sync android` | Sync web assets to Android |
| `open:android` | `npx cap open android` | Open project in Android Studio |

---

## 🔐 App Signing (For Play Store)

To publish on Google Play Store, you need a signed APK:

1. **Generate keystore**:
   ```bash
   keytool -genkey -v -keystore samarth-erp.keystore -alias samarth-key -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure signing in Android Studio**:
   - Build → Generate Signed Bundle / APK
   - Follow the wizard

3. **Upload to Play Store Console**:
   - Create developer account ($25 one-time fee)
   - Follow publishing guidelines

---

## 🐛 Troubleshooting

### Build Fails in Android Studio

- **Clear cache**: File → Invalidate Caches → Restart
- **Update Gradle**: Follow Android Studio prompts
- **Check JDK version**: File → Project Structure → SDK Location

### App Can't Connect to Backend

- ✅ Check backend is running
- ✅ Check `.env.production` has correct URL
- ✅ Rebuild after changing `.env.production`
- ✅ Check network permissions in AndroidManifest.xml
- ✅ For ngrok, ensure tunnel is active

### White Screen on Launch

- Run `npm run build:mobile` again
- Check browser console in Chrome DevTools (chrome://inspect)

---

## 📱 Testing Checklist

Before releasing, test these features:

### Authentication
- [ ] Login with all roles (Admin, Teacher, Student, Parent)
- [ ] Logout
- [ ] Remember me functionality

### Admin Portal
- [ ] Dashboard loads correctly
- [ ] Add/Edit students
- [ ] Add/Edit teachers
- [ ] Fee management
- [ ] Reports generation

### Teacher Portal
- [ ] Mark attendance
- [ ] Enter marks
- [ ] Upload notes
- [ ] View assigned classes

### Student Portal
- [ ] View attendance
- [ ] View marks/grades
- [ ] Download notes
- [ ] Apply for leave
- [ ] View scholarships
- [ ] Fee payment

### Parent Portal
- [ ] View ward's attendance
- [ ] View ward's marks
- [ ] View fee status
- [ ] Receive notifications

### General
- [ ] Responsive layout on different screen sizes
- [ ] Network error handling
- [ ] File upload/download
- [ ] Images load correctly
- [ ] Navigation smooth

---

## 📊 App Information

- **App Name**: Samarth College ERP
- **Package ID**: `com.samarthcollege.erp`
- **Version**: 1.0.0
- **Target SDK**: Android 13 (API 33)
- **Min SDK**: Android 5.0 (API 21)

---

## 🎉 Success!

Your ERP system is now a mobile app! 🚀

The app runs the exact same code as your web version, sharing the same:
- ✅ Backend API
- ✅ Database
- ✅ Authentication
- ✅ All features

---

## 📞 Support

For issues or questions:
- Email: support@samarthcollege.edu.in
- Check backend console for API errors
- Check browser console: `chrome://inspect` while app is running

---

**Built with ❤️ using Capacitor**
