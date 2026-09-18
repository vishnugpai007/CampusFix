# CampusFix 🛠️

> **A clean, reliable, and role-based campus maintenance reporting and issue-tracking web application.**

---

## 📌 Overview & Features

In many educational institutions and hostel complexes, infrastructure issues—such as faulty Wi-Fi routers, plumbing leaks, broken furniture, or electrical outages—are reported through informal channels or paper registers. 

**CampusFix** provides a centralized digital portal with:

1. **3-Role Authentication System (`Student`, `Staff`, `Host`)**:
   - **Student Portal**: Submit geotagged maintenance reports with photos, track status updates, and upvote priority issues.
   - **Staff Portal**: View maintenance queues, filter by status, assign priority, and update resolution states (`in_progress`, `resolved`).
   - **Host Portal (Hostel Operations)**: Full management command over general campus maintenance queues and confidential **Ragging Desk** reports.
2. **Confidential Ragging Desk**:
   - Dedicated private reporting channel strictly accessible and managed by the **Host** role.
3. **Full Dark / Light Theme System**:
   - Seamless dark/light theme switching across all components, cards, forms, and pages.
4. **Modern UI & Branding**:
   - Official CampusFix brand logo and wordmark header.

---

## 🛠️ Tech Stack

### Frontend
- **React 18**: Responsive SPA with component-driven architecture.
- **Vite 5**: Fast build tool & instant HMR.
- **TailwindCSS 3**: Utility-first design system supporting dark class mode.
- **React Hook Form & Zod**: Type-safe client validation and instant error handling.
- **Axios**: HTTP client with JWT interceptors.
- **Lucide React**: Clean icons.

### Backend
- **Node.js & Express**: Asynchronous REST API backend.
- **MongoDB & Mongoose**: Flexible document model for users, issues, and comments.
- **JSON Web Tokens (JWT)**: Role-embedded access tokens for stateless authorization.
- **Cloudinary**: Cloud image upload storage.
- **Helmet & Rate Limit**: Express security middleware.

---

## 📁 Directory Folder Structure

```text
CampusFix/
├── client/                     # Frontend React SPA
│   ├── public/                 # Static public assets (logo.png)
│   ├── src/
│   │   ├── api/                # Axios client instance
│   │   ├── components/         # UI & Layout components
│   │   │   ├── layout/         # Layout.jsx, Navbar.jsx
│   │   │   ├── routes/         # ProtectedRoute.jsx
│   │   │   └── ui/             # HeroSection, ThemeToggle, LoginForm, Categories, Steps
│   │   ├── context/            # AuthContext, ThemeContext, ToastContext
│   │   ├── pages/              # LandingPage, RoleLoginPage, StaffDashboardPage, HostDashboardPage, etc.
│   │   ├── App.jsx             # React Router setup
│   │   ├── index.css           # Global Tailwind & dark mode rules
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Backend Node.js Express API
│   ├── src/
│   │   ├── config/             # DB & Cloudinary configuration
│   │   ├── controllers/        # Auth, Issue, Comment handlers
│   │   ├── middleware/         # Auth, Role Verification (`requireRole`), Upload, Validation
│   │   ├── models/             # User (with role enum: student, staff, host), Issue, Comment
│   │   ├── routes/             # API routes
│   │   ├── seed.js             # Database seeder for demo accounts
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
│
└── README.md
```

---

## 🔐 3-Role Authentication Portals

| Role | Portal Path | Responsibilities & Access Level |
| :--- | :--- | :--- |
| **Student** | `/login/student` | Report campus issues, upload photos, upvote urgent tickets, track personal reports. |
| **Staff** | `/login/staff` | Manage issue operations, filter ticket queue, mark status to `In Progress` or `Resolved`. |
| **Host** | `/login/host` | Oversee all hostel operations + exclusive access to confidential **Ragging Desk** reports. |

---

## ⚡ Local Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance or Atlas connection URI

### 1. Clone Repository
```bash
git clone https://github.com/vishnugpai007/CampusFix.git
cd CampusFix
```

### 2. Backend Setup
```bash
cd server
npm install
```
Configure `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/campusfix
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
CORS_ORIGIN=http://localhost:5173
```
Run backend server:
```bash
npm run dev
```

### 3. Frontend Setup
In another terminal:
```bash
cd client
npm install
```
Configure `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
```
Run frontend client:
```bash
npm run dev
```

---

## 🌐 API Reference Table

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/register` | No | Register new student account (`role: student`) |
| `POST` | `/login` | No | Authenticate user & return JWT containing role |
| `POST` | `/logout` | Yes | Log out and revoke tokens |
| `GET` | `/me` | Yes | Get authenticated user profile & role |

### Issues (`/api/v1/issues`)
| Method | Endpoint | Auth Required | Roles Allowed | Description |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/` | Yes | All | Fetch issues feed with filters and search |
| `POST` | `/` | Yes | `student` | Submit new maintenance ticket |
| `PATCH` | `/:id/status` | Yes | `staff`, `host` | Update issue status (`in_progress`, `resolved`) |
| `POST` | `/:id/upvote` | Yes | All | Toggle upvote on maintenance ticket |

---

## 🚀 Cloud Deployment

- **Frontend**: Deployed on [Vercel](https://vercel.com) (`client/` root).
- **Backend**: Deployed on [Render](https://render.com) (`server/` root).
