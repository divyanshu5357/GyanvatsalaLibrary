# 📦 GitHub Upload & Vercel Deployment Guide

## Table of Contents
1. [Upload to GitHub](#upload-to-github)
2. [Deploy to Vercel](#deploy-to-vercel)
3. [Configure Environment Variables](#configure-environment-variables)
4. [Running on Port 3001](#running-on-port-3001)
5. [Troubleshooting](#troubleshooting)

---

## ✅ Upload to GitHub

### Step 1: Create a New Repository on GitHub
1. Go to [github.com/new](https://github.com/new)
2. Repository name: `library-management-system`
3. Description: `A professional library management system with React, Vite, and Node.js backend`
4. Choose: **Public** (to allow deployment on Vercel free tier)
5. Click **Create repository**

### Step 2: Get Your Repository URL
After creating the repository, GitHub will show you a URL like:
```
https://github.com/YOUR_USERNAME/library-management-system.git
```

### Step 3: Push to GitHub

Run these commands in your project directory:

```bash
cd /Users/sakshisingh/Desktop/Frontend/react_js/LibararyManagment

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/library-management-system.git

# Rename branch to main (Vercel uses main by default)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username**

### Step 4: Verify on GitHub
- Go to your GitHub repository URL
- You should see all your files uploaded ✅

---

## 🚀 Deploy to Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up**
3. Choose **GitHub** authentication
4. Authorize Vercel to access your GitHub repositories

### Step 2: Import Your Project
1. After signing in, click **Add New Project**
2. Click **Import Git Repository**
3. Select your `library-management-system` repository
4. Click **Import**

### Step 3: Configure Project Settings

**Framework Preset:** React
**Build Command:** `npm run build`
**Output Directory:** `dist`

### Step 4: Add Environment Variables

Click **Environment Variables** and add:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

**Get these values from:**
- **Supabase**: Project Settings → API Keys
- **Cloudinary**: Dashboard → API Keys

### Step 5: Deploy
1. Click **Deploy**
2. Wait for build to complete (usually 2-3 minutes)
3. Once complete, you'll get a URL like: `https://library-management-system.vercel.app`

---

## 🔧 Configure Environment Variables

### For Local Development
Create `.env` file in project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend Configuration
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
NODE_ENV=development

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_UPLOAD_PRESET=your-preset
```

### For Vercel Deployment
Add variables in:
**Project Settings** → **Environment Variables**

---

## 🎯 Running on Port 3001

### Local Development

**Terminal 1 - Build Frontend:**
```bash
npm run build
```

**Terminal 2 - Run Backend Server:**
```bash
node server.js
```

Server will start on: `http://localhost:3001`

### Production (Vercel)

Your app will run on Vercel's servers automatically:
- Frontend: Served from `/dist`
- Backend API: Routes through same domain
- Port 3001 is handled internally by Vercel

Access at: `https://your-app.vercel.app`

---

## 🐛 Troubleshooting

### Build Fails on Vercel

**Error:** "npm ERR! gyp ERR!"
- **Solution:** Check if all dependencies are in `package.json`
- Run locally: `npm install && npm run build`

**Error:** "Cannot find module 'supabase'"
- **Solution:** Install dependencies:
  ```bash
  npm install
  ```

### Environment Variables Not Working

- Verify variables added in Vercel Project Settings
- Redeploy after adding variables: Click **Deployments** → Select latest → **Redeploy**
- Check variable names match exactly (case-sensitive)

### API Calls Return 404

- Verify `server.js` routes are correct
- Check API endpoints in `src/utils/api.js` use relative paths
- Ensure environment variables are set

### Images Not Loading

- Check that background image is at: `/public/image/hero-bg.jpg`
- Verify image is included in build: `npm run build`
- Check `/dist/image/hero-bg.jpg` exists after build

---

## 📋 File Structure After Build

```
dist/
├── index.html              # Main HTML entry point
├── assets/
│   ├── index-*.css        # Compiled styles
│   └── index-*.js         # Compiled JavaScript (487 KB)
└── image/
    └── hero-bg.jpg        # Background image
```

---

## 🔐 Security Best Practices

### Before Deploying:

✅ **Never commit `.env` file** - Already in `.gitignore`
✅ **Use environment variables** for sensitive data
✅ **Rotate admin passwords** after first deployment
✅ **Enable Supabase RLS** on all tables
✅ **Set up Vercel branch protection** for production

### Vercel Security:

1. Go to **Project Settings** → **Git**
2. Under **Deploy Hooks**, set production branch to `main`
3. Enable **Preview Deployments** for feature branches

---

## 📊 Deployment Checklist

- [ ] Git repository created on GitHub
- [ ] Code pushed to `main` branch
- [ ] Vercel account created and connected
- [ ] Environment variables added
- [ ] Initial build successful
- [ ] Application accessible at Vercel URL
- [ ] API endpoints working correctly
- [ ] Authentication functioning
- [ ] Database connected properly
- [ ] Background images loading

---

## 🚀 Next Steps

1. **Monitor Your App:**
   - Vercel Dashboard shows all deployments
   - View logs: **Deployments** → Select deployment → **Logs**

2. **Custom Domain (Optional):**
   - **Project Settings** → **Domains**
   - Add your custom domain
   - Update DNS records as instructed

3. **Auto-Deployment:**
   - Vercel automatically deploys when you push to `main`
   - Preview deployments for pull requests

4. **Rollback (If Needed):**
   - **Deployments** tab shows all previous builds
   - Click any deployment and select **Redeploy**

---

## ❓ FAQ

**Q: Will my app run on port 3001 on Vercel?**
A: No, Vercel assigns its own port. Your app will be accessible at `https://your-app.vercel.app` (HTTPS only). Internally, Vercel manages the port.

**Q: Can I use a different database?**
A: Yes! Update connection strings in environment variables and your code.

**Q: How do I update my app?**
A: Push changes to GitHub → Vercel automatically redeploys.

**Q: Is there a free tier?**
A: Yes! Vercel offers generous free tier for hobby projects.

**Q: How do I see server logs?**
A: **Project Settings** → **Function Logs** or **Deployments** → Select → **Logs**

---

## 📞 Support

For issues:
1. Check Vercel Logs: **Deployments** → **Logs**
2. Review [Vercel Documentation](https://vercel.com/docs)
3. Check [Supabase Documentation](https://supabase.com/docs)
4. Review [Node.js Documentation](https://nodejs.org/docs)

---

**Last Updated:** April 3, 2026
**Status:** ✅ Ready for Production
