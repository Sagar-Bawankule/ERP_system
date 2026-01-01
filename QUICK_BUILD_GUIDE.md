# 📱 Quick Reference: Building Android APK

## One-Page Guide for Mobile App

---

## ⚡ Quick Build (3 Steps)

### 1️⃣ Setup Backend URL

**Option A - Using ngrok (Easy)**:
```bash
# Terminal 1: Start backend
cd e:\ERP_system\backend
npm start

# Terminal 2: Expose with ngrok
ngrok http 5000

# Copy the HTTPS URL shown (e.g., https://abc123.ngrok.io)
```

**Update frontend/.env.production**:
```env
REACT_APP_API_URL=https://abc123.ngrok.io/api
```

### 2️⃣ Build & Sync

```bash
cd e:\ERP_system\frontend
npm run build:mobile
```

### 3️⃣ Generate APK

```bash
npm run open:android
```

In Android Studio:
- Wait for Gradle sync
- **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
- APK location: `android/app/build/outputs/apk/release/`

---

## 📱 Install on Phone

**Method 1 - USB**:
1. Enable Developer Mode on phone
2. Enable USB Debugging
3. Connect via USB
4. Drag APK to phone and install

**Method 2 - File Transfer**:
1. Copy APK to phone storage
2. Open file and install
3. Allow "Install from Unknown Sources"

---

## 🐛 Troubleshooting

**Build fails in Android Studio?**
```
File → Invalidate Caches → Restart
```

**App can't connect to backend?**
- ✅ Check ngrok is running
- ✅ Verify URL in .env.production
- ✅ Rebuild after changing .env

**White screen on launch?**
```bash
npm run build:mobile
# Then rebuild APK in Android Studio
```

---

## 📋 NPM Scripts

| Command | What it does |
|---------|--------------|
| `npm run build:mobile` | Build + sync (one command!) |
| `npm run sync:android` | Sync web → Android only |
| `npm run open:android` | Open Android Studio |

---

## ✅ Testing Checklist

After installing APK:

- [ ] Login works (all roles)
- [ ] Dashboards load
- [ ] Data displays correctly
- [ ] Forms submit successfully
- [ ] Files upload/download
- [ ] Navigation smooth

---

## 📞 Need Help?

Full guide: [MOBILE_APP_GUIDE.md](./MOBILE_APP_GUIDE.md)

---

**Build Time: ~5-10 minutes** ⚡
