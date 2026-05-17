# Task Manager

Full-stack team task management app with role-based access, dark mode, and collapsible sidebar.

## Tech Stack

- **Backend**: Node.js, Express, SQLite (better-sqlite3), JWT auth
- **Frontend**: React 18, Vite, React Router

## Features

- **Authentication** — Signup / Login with JWT (distinct error messages: "User does not exist" vs "Wrong password")
- **Password visibility toggle** — Eye icon to show/hide password
- **Projects** — Create, update, delete with team membership
- **Tasks** — Create, edit, delete, assign, status (todo / in-progress / done), priority (low / medium / high), due dates
- **Role-based access** — Global role (admin/member) + per-project role
- **Dashboard** — Stats cards, overdue tasks (red), recent tasks table
- **Upcoming Deadlines** — Sidebar section showing tasks due within 2 days (admins see all, members see only assigned)
- **Team management** — Add member via dropdown of all users or manual email, change role, remove
- **Dark / Light mode** — Floating toggle at top-right, persisted in localStorage
- **Collapsible sidebar** — ≡ toggle, shows tooltips on hover when collapsed
- **Profile section** — Avatar, name, email, role badge in sidebar footer
- **Animated loader** — Loader with rotating taglines, progress bar, percentage, floating particles, step dots
- **Responsive** — Adapts to mobile

## Setup

```bash
npm install               # installs root + server + client deps (via postinstall)
npm run dev               # runs server:3001 + client:5173 concurrently
```

To seed sample data:

```bash
npm run seed
```

**Sample accounts** (password for all: `password123`):

| Email | Role |
|---|---|
| alice@example.com | admin |
| bob@example.com | member |
| charlie@example.com | member |
| diana@example.com | member |

## Deployment

```bash
npm run build             # builds frontend to client/dist
npm start                 # starts server (serves API + built frontend)
```

Set `JWT_SECRET` env var in production. The app listens on `process.env.PORT`.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/signup | No | Create account |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Current user |
| GET | /api/projects | Yes | List user's projects |
| POST | /api/projects | Yes | Create project |
| GET | /api/projects/:id | Yes | Project detail with members + tasks |
| PUT | /api/projects/:id | Admin | Update project |
| DELETE | /api/projects/:id | Admin | Delete project |
| POST | /api/projects/:id/members | Admin | Add member |
| PUT | /api/projects/:id/members/:userId | Admin | Change member role |
| DELETE | /api/projects/:id/members/:userId | Admin | Remove member |
| GET | /api/tasks/project/:projectId | Yes | List project tasks |
| POST | /api/tasks/project/:projectId | Member+ | Create task |
| PUT | /api/tasks/:id | Yes | Update task |
| DELETE | /api/tasks/:id | Admin | Delete task |
| GET | /api/dashboard | Yes | Dashboard stats + overdue + upcoming deadlines |
| GET | /api/users/all | Yes | List all registered users |
| GET | /api/users/search?q= | Yes | Search users by name/email |
