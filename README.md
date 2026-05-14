# Team Task Manager

Full-stack team task management app with role-based access control.

## Tech Stack

- **Backend**: Node.js, Express, SQLite (better-sqlite3), JWT auth
- **Frontend**: React, Vite, React Router

## Features

- Authentication (signup/login) with JWT
- Project CRUD with team membership
- Task CRUD with assignment, status, priority, due dates
- Role-based access (Admin/Member) at global and project level
- Dashboard with task summaries, overdue tracking, recent activity
- Project team management (add/remove members, change roles)

## Setup

```bash
npm run setup    # Install all dependencies
npm run dev      # Run backend + frontend in dev mode
```

For production:

```bash
npm run build    # Build frontend
npm start        # Start server (serves API + built frontend)
```

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
| GET | /api/dashboard | Yes | Dashboard stats |

## Deployment

1. Push to GitHub
2. On Railway, create a new project from repo
3. Set start command: `npm run build && npm start`
4. Add `JWT_SECRET` environment variable
5. Deploy
