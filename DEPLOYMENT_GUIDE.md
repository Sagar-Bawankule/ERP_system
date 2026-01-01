# 🚀 Render Deployment Guide - College ERP System

## Prerequisites Checklist
- [x] Code pushed to GitHub: `https://github.com/road2tec/College-ERP-System-Mern`
- [ ] MongoDB Atlas account created
- [ ] Render account created
- [ ] Cloudinary account (already have credentials)

---

## Part 1: MongoDB Atlas Setup (5 minutes)

### 1. Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google or email
3. Choose **FREE** tier (M0 Sandbox)

### 2. Create Database Cluster
1. Click "Build a Database"
2. Choose **FREE** (M0) tier
3. Select cloud provider: **AWS** (recommended)
4. Region: Choose closest to you
5. Cluster Name: `college-erp-cluster`
6. Click "Create"

### 3. Create Database User
1. Security → Database Access → Add New Database User
2. Authentication Method: **Password**
3. Username: `erp_admin`
4. Password: Click "Autogenerate Secure Password" (owy5wdg1ECF9e7Nw)
5. Database User Privileges: **Read and write to any database**
6. Click "Add User"

### 4. Configure Network Access
1. Security → Network Access → Add IP Address
2. Click "Allow Access from Anywhere" (0.0.0.0/0)
3. Click "Confirm"

### 5. Get Connection String
1. Go to Database → Connect
2. Choose "Connect your application"
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string:
   ```
   mongodb+srv://erp_admin:<password>@college-erp-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   
   ```
5. Replace `<password>` with your actual password
6. Add database name: `mongodb+srv://erp_admin:YOUR_PASSWORD@college-erp-cluster.xxxxx.mongodb.net/erp_system?retryWrites=true&w=majority`

**SAVE THIS CONNECTION STRING!** You'll need it for Render.

---

## Part 2: Deploy Backend on Render (10 minutes)

### 1. Create Render Account
1. Go to https://render.com/
2. Sign up with GitHub (recommended)
3. Authorize Render to access your repositories

### 2. Create Web Service for Backend
1. Dashboard → "New +" → "Web Service"
2. Connect Repository: `road2tec/College-ERP-System-Mern`
3. Configure:
   - **Name**: `college-erp-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 3. Add Environment Variables
Click "Advanced" → "Add Environment Variable"

Add these one by one:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | Your MongoDB connection string from Part 1 |
| `JWT_SECRET` | Generate with: `openssl rand -base64 32` or use any 32+ char string |
| `JWT_EXPIRE` | `30d` |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `FRONTEND_URL` | `https://college-erp.onrender.com` (we'll update this later) |

### 4. Deploy Backend
1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. Once deployed, you'll see: **"Your service is live 🎉"**
4. **SAVE YOUR BACKEND URL**: `https://college-erp-backend.onrender.com`

### 5. Test Backend
Open: `https://college-erp-backend.onrender.com/api/health` (or similar test endpoint)

---

## Part 3: Deploy Frontend on Render (10 minutes)

### 1. Create Static Site for Frontend
1. Dashboard → "New +" → "Static Site"
2. Connect Repository: `road2tec/College-ERP-System-Mern`
3. Configure:
   - **Name**: `college-erp`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

### 2. Add Environment Variables
Click "Advanced" → "Add Environment Variable"

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://college-erp-backend.onrender.com/api` |

### 3. Deploy Frontend
1. Click "Create Static Site"
2. Wait 5-10 minutes for deployment
3. **SAVE YOUR FRONTEND URL**: `https://college-erp.onrender.com`

---

## Part 4: Update Backend CORS (IMPORTANT!)

### 1. Update FRONTEND_URL in Backend
1. Go to Render Dashboard → `college-erp-backend`
2. Environment → Edit `FRONTEND_URL`
3. Change to: `https://college-erp.onrender.com`
4. Save (this will trigger a redeploy)

---

## Part 5: Create Initial Admin User

### Option A: Via MongoDB Atlas (Recommended)

1. Go to MongoDB Atlas → Database → Browse Collections
2. Database: `erp_system`
3. Collection: `users`
4. Click "Insert Document"
5. Switch to "JSON View" and paste:

```json
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@college.edu",
  "password": "$2a$10$YourHashedPasswordHere",
  "role": "admin",
  "phone": "1234567890",
  "isActive": true,
  "createdAt": {"$date": "2024-01-01T00:00:00.000Z"},
  "updatedAt": {"$date": "2024-01-01T00:00:00.000Z"}
}
```

**To generate hashed password:**
- Use online bcrypt generator: https://bcrypt-generator.com/
- Input: `admin123`
- Rounds: `10`
- Copy the hash and replace `$2a$10$YourHashedPasswordHere`

### Option B: Via Backend Script (Advanced)

Create a temporary route in backend to create admin user, then remove it.

---

## Part 6: Test Your Deployment! 🎉

1. **Visit Frontend**: `https://college-erp.onrender.com`
2. **Login**: 
   - Email: `admin@college.edu`
   - Password: `admin123`
3. **Test Features**:
   - Create a student
   - Upload a profile image (tests Cloudinary)
   - Create a class
   - Create a teaching assignment

---

## Important Notes

### Free Tier Limitations
- **Cold Starts**: Free services spin down after 15 minutes of inactivity
- **First request after sleep**: Takes ~30 seconds to wake up
- **Solution**: Upgrade to paid tier ($7/month) for always-on service

### Monitoring
- **Backend Logs**: Render Dashboard → college-erp-backend → Logs
- **Frontend Logs**: Render Dashboard → college-erp → Logs
- **Database**: MongoDB Atlas → Metrics

### Custom Domain (Optional)
1. Render Dashboard → Your Service → Settings → Custom Domain
2. Add your domain (e.g., `erp.yourcollege.edu`)
3. Update DNS records as instructed

---

## Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify all environment variables are set
- Check MongoDB connection string is correct

### Frontend shows "Network Error"
- Verify `REACT_APP_API_URL` is correct
- Check backend is running
- Verify CORS is configured correctly

### Login fails
- Check admin user exists in MongoDB
- Verify password hash is correct
- Check JWT_SECRET is set

---

## Security Checklist
- [ ] MongoDB password is strong
- [ ] JWT_SECRET is 32+ characters
- [ ] .env files are in .gitignore
- [ ] CORS only allows your frontend URL
- [ ] MongoDB network access restricted (optional: set to Render IPs only)

---

## Next Steps After Deployment
1. Change default admin password
2. Create other admin users
3. Import student/teacher data
4. Set up regular backups (MongoDB Atlas automatic)
5. Monitor usage and upgrade if needed

---

## Cost Summary
- **MongoDB Atlas**: FREE (512MB)
- **Render Backend**: FREE (750 hours/month)
- **Render Frontend**: FREE (100GB bandwidth)
- **Cloudinary**: FREE (25GB storage)
- **Total**: $0/month

**When to upgrade**: 
- Backend needs to be always-on: $7/month
- Database > 512MB: $9/month
- Total: ~$16/month

---

## Support
- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Your GitHub Repo: https://github.com/road2tec/College-ERP-System-Mern

Good luck with your deployment! 🚀
