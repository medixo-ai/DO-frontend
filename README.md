# IntelliDocs AI – Enterprise Knowledge Assistant

A modern, enterprise-grade React frontend for an AI-powered document search platform.

## Tech Stack

- **React 18** + **Vite 5**
- **Tailwind CSS** – utility-first styling with dark mode
- **React Router v6** – client-side routing
- **Framer Motion** – page and element animations
- **Recharts** – analytics charts
- **Lucide React** – icon set

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Demo Accounts

| Role     | Email                        | Password  |
|----------|------------------------------|-----------|
| Admin    | admin@intellidocs.com        | admin123  |
| Manager  | manager@intellidocs.com      | admin123  |
| Employee | employee@intellidocs.com     | admin123  |

## Pages

| Route              | Page                   | Access         |
|--------------------|------------------------|----------------|
| `/`                | Landing Page           | Public         |
| `/login`           | Login                  | Public         |
| `/register`        | Register               | Public         |
| `/forgot-password` | Forgot Password        | Public         |
| `/dashboard`       | Dashboard              | All roles      |
| `/search`          | AI Search              | All roles      |
| `/documents`       | Document Library       | All roles      |
| `/documents/:id`   | Document Detail        | All roles      |
| `/upload`          | Upload Documents       | Admin, Manager |
| `/departments`     | Departments            | Admin, Manager |
| `/analytics`       | Analytics Dashboard    | Admin, Manager |
| `/users`           | User Management        | Admin only     |
| `/settings`        | Settings               | Admin          |
| `/profile`         | Profile                | All roles      |

## Features

- ✅ Role-based access control (Admin / Manager / Employee)
- ✅ Light & Dark mode
- ✅ AI Search chat with mock answers and source citations
- ✅ Document library (grid & list view, filter, search)
- ✅ Drag-and-drop file upload with progress
- ✅ User management CRUD (Admin)
- ✅ Analytics dashboard with Recharts
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Mobile navigation drawer
- ✅ Notification panel
- ✅ Loading skeletons and empty states
- ✅ Smooth Framer Motion animations

## Project Structure

```
src/
├── components/
│   ├── layout/        # AppLayout, Sidebar, Header
│   └── shared/        # StatCard, Badge, Modal, EmptyState, etc.
├── context/           # ThemeContext, AuthContext
├── data/              # mockData.js
├── pages/
│   ├── auth/          # Login, Register, ForgotPassword
│   ├── dashboard/     # Dashboard, AISearch, Documents, Upload, etc.
│   └── admin/         # Users page
└── utils/             # helpers.js
```
