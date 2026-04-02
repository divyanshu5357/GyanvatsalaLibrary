# 📚 Library Management System

A **professional, full-stack library management application** built with React, Vite, Node.js, and Supabase.

[![Live Demo](https://img.shields.io/badge/Live-Vercel-blue?style=flat-square)](https://library-management-system.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Source-181717?style=flat-square&logo=github)](https://github.com/YOUR_USERNAME/library-management-system)

---

## ✨ Features

- **🔐 Secure Authentication** - Supabase Auth with JWT tokens
- **👥 Role-Based Access** - Admin, Student, and Staff roles
- **📖 Book Management** - Add, edit, delete library books
- **👤 Student Management** - Track student information and borrowing history
- **💳 Fee Management** - Smart fee tracking with automatic reminders
- **🔔 Real-time Notifications** - Automatic fee reminders and updates
- **📊 Analytics Dashboard** - Visual insights and statistics
- **📱 Responsive Design** - Works on mobile, tablet, and desktop
- **🎨 Modern UI** - Beautiful TailwindCSS styling
- **⚡ Fast Performance** - Optimized with Vite (487 KB bundle)

---

## 🚀 Quick Start

### 1. Clone Repository
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
cp .env.example .env
# Edit .env with your credentials
```

### 4. Build & Run
```bash
# Build for production
npm run build

# Start backend server (port 3001)
node server.js

# Or for development
npm run dev  # Vite dev server on 5173
```

### 5. Access Application
```
Local:    http://localhost:3001
Dev:      http://localhost:5173
```

---

## 📋 Environment Variables

Create `.env` file with:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server
PORT=3001
NODE_ENV=development

# Cloudinary (for images)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_UPLOAD_PRESET=your-preset
```

Get these from:
- **Supabase**: https://supabase.com/dashboard → Settings → API
- **Cloudinary**: https://cloudinary.com/console → Settings

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite 5.4** - Build tool (487 KB bundle)
- **TailwindCSS** - Styling
- **React Router** - Routing
- **Supabase JS** - Authentication & Database

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Supabase** - Database & Auth
- **WebPush** - Notifications

### Database
- **PostgreSQL** (via Supabase)
- **RLS** - Row-level security
- **Real-time** - Live updates

---

## 📁 Project Structure

```
├── src/
│   ├── components/        # Reusable React components
│   ├── pages/            # Page components
│   ├── contexts/         # React context (Auth, Notifications)
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main app
│   └── main.jsx          # Entry point
├── public/
│   └── image/            # Static images
├── dist/                 # Production build (npm run build)
├── server.js             # Node.js backend
├── package.json          # Dependencies
├── vercel.json           # Vercel config
├── vite.config.js        # Vite config
└── tailwind.config.cjs   # TailwindCSS config
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

**See complete guide**: `GITHUB_VERCEL_COMPLETE_GUIDE.md`
**Quick start**: `START_HERE.md`
**Copy-paste commands**: `COMMANDS_TO_RUN.md`

#### Quick Steps:
1. Push to GitHub: `git push origin main`
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Add environment variables
5. Click Deploy ✅

#### Your app will be live at:
```
https://library-management-system.vercel.app
```

---

## 📚 Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server (5173)
npm run build           # Build for production
npm run preview         # Preview production build

# Production
node server.js          # Start backend (3001)
npm start               # Alias for build

# Git
git push origin main    # Push to GitHub (Vercel auto-deploys)
```

---

## 🔐 Security Features

✅ **No Hardcoded Credentials** - All sensitive data in environment variables
✅ **JWT Authentication** - Secure token-based auth
✅ **Row-Level Security** - Database-level access control
✅ **HTTPS Only** - Vercel enforces HTTPS
✅ **Environment Isolation** - .env excluded from git

---

## 📊 Features Breakdown

### Authentication
- Supabase Auth integration
- Email/password login
- Profile creation on signup
- Secure session management
- Auto-logout on inactivity

### Dashboard
- Real-time data updates
- Analytics cards (students, books, fees)
- Quick action buttons
- User profile management

### Student Management
- Add/Edit/Delete students
- View student details
- Track borrowing history
- Fee status tracking

### Fee Management
- Set fee amounts and due dates
- Automatic reminders (3 days before due)
- Mark fees as paid
- Payment history tracking

### Notifications
- Real-time fee reminders
- Push notifications
- Email alerts (optional)
- Notification history

---

## 🐛 Troubleshooting

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port Already in Use
```bash
# Kill process on port 3001
lsof -i :3001
kill -9 <PID>

# Then restart
node server.js
```

### Supabase Connection Error
- Verify credentials in `.env`
- Check Supabase project is active
- Verify RLS policies are set correctly

### Vercel Build Failure
- Check `npm run build` works locally
- Verify all environment variables are set
- Check `.gitignore` doesn't exclude important files
- Review build logs in Vercel dashboard

---

## 📖 Documentation

| File | Purpose |
|------|---------|
| `START_HERE.md` | 🎯 Start here for quick overview |
| `GITHUB_VERCEL_COMPLETE_GUIDE.md` | 📋 Complete step-by-step guide |
| `COMMANDS_TO_RUN.md` | 📟 Copy-paste commands |
| `DEPLOYMENT_GUIDE.md` | 📦 Detailed deployment info |
| `QUICKSTART.md` | ⚡ Quick local setup |

---

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/my-feature`
2. Make changes and commit: `git commit -m "Add feature"`
3. Push to GitHub: `git push origin feature/my-feature`
4. Create Pull Request
5. Vercel creates preview deployment automatically

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👤 Author

Created by **Sakshi Singh**

---

## 🔗 Links

- **Live Demo**: https://library-management-system.vercel.app
- **GitHub Repository**: https://github.com/YOUR_USERNAME/library-management-system
- **Supabase**: https://supabase.com
- **Vercel**: https://vercel.com
- **React**: https://react.dev
- **Vite**: https://vitejs.dev

---

## 📞 Support

For issues or questions:
1. Check `DEPLOYMENT_GUIDE.md`
2. Review error messages in Vercel logs
3. Check `.env` file configuration
4. Verify all dependencies are installed

---

## ✅ Production Checklist

Before deploying to production:

- [ ] All environment variables set
- [ ] `.env` file in `.gitignore`
- [ ] `npm run build` runs successfully
- [ ] `node server.js` starts without errors
- [ ] Login works with test account
- [ ] Database connected properly
- [ ] Images load correctly
- [ ] Responsive design verified
- [ ] No console errors
- [ ] All features tested

---

**Happy coding! 🚀**

---

**Last Updated**: April 3, 2026  
**Status**: ✅ Production Ready
