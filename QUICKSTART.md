# 🚀 Quick Start Guide

## Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Git installed
- GitHub account
- Vercel account (free)

## Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/library-management-system.git
cd library-management-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
# Copy example file
cp .env.example .env

# Edit .env with your actual values
nano .env  # or use your editor
```

Add your values:
- `VITE_SUPABASE_URL` - From Supabase dashboard
- `VITE_SUPABASE_ANON_KEY` - From Supabase dashboard
- `SUPABASE_SERVICE_ROLE_KEY` - From Supabase dashboard
- `CLOUDINARY_CLOUD_NAME` - From Cloudinary
- `CLOUDINARY_UPLOAD_PRESET` - From Cloudinary

### 4. Build Frontend
```bash
npm run build
```

### 5. Start Backend Server
```bash
node server.js
```

Server runs on: **http://localhost:3001** ✅

---

## Deployment to Vercel

### Option 1: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### Option 2: Using GitHub Integration (Easier)

1. Push code to GitHub (see `DEPLOYMENT_GUIDE.md`)
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables
6. Click "Deploy"

---

## Environment Setup for Vercel

Add these to Vercel Project Settings > Environment Variables:

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
CLOUDINARY_CLOUD_NAME = your-cloud-name
CLOUDINARY_UPLOAD_PRESET = your-preset
```

---

## Available Scripts

```bash
npm run dev       # Start Vite dev server (5173)
npm run build     # Build for production
npm run preview   # Preview production build
npm start         # Alias for build
node server.js    # Run backend on port 3001
```

---

## Project Structure

```
├── src/
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── contexts/        # React contexts
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main app
│   └── main.jsx         # Entry point
├── public/
│   └── image/           # Static images
├── dist/                # Production build (generated)
├── server.js            # Node.js backend
├── vite.config.js       # Vite configuration
├── vercel.json          # Vercel deployment config
└── package.json         # Dependencies
```

---

## Features

✅ **Authentication** - Supabase Auth with JWT
✅ **Database** - Supabase PostgreSQL
✅ **File Upload** - Cloudinary integration
✅ **Real-time Notifications** - Fee reminders, updates
✅ **Role-Based Access** - Admin, Student, Staff
✅ **Responsive Design** - Mobile, Tablet, Desktop
✅ **Professional UI** - TailwindCSS with custom styling
✅ **Auto-Reminders** - Scheduled fee notifications

---

## Support & Issues

- **Deployment Issues**: See `DEPLOYMENT_GUIDE.md`
- **Setup Issues**: Check environment variables
- **Authentication Issues**: Verify Supabase credentials
- **UI Issues**: Clear browser cache and rebuild

---

**Happy Coding! 🎉**
