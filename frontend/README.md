# TimeTablePro — Frontend

A complete **React frontend** for a School Timetable Management System, built for the Pakistani
school market. This delivers the UI/UX only — mock data and simulated services stand in for the
future Laravel + MySQL backend, structured so that backend can be swapped in without touching
components.

```
React Frontend  →  Laravel REST API  →  MySQL Database
```

## Tech stack

- React 19 + Vite
- Tailwind CSS
- React Router (role-based route groups)
- Zustand (app state — auth, timetable, conflicts, notifications, constraints, approvals)
- Recharts (workload / distribution charts)
- lucide-react (icons)

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## Authentication

The login system supports two methods:

### Email & Password
Sign in with your school account. Demo credentials available:

| Role              | Email                        | Password   |
|-------------------|-------------------------------|-----------|
| Principal         | principal@alfalah.edu.pk      | demo1234  |
| Timetable Manager | manager@alfalah.edu.pk        | demo1234  |
| Teacher           | teacher@alfalah.edu.pk        | demo1234  |

### Google Sign-in
Sign in using your Google account. Currently returns a mock teacher account for demo purposes.

Set `VITE_API_URL=http://localhost:8000` in a local `.env` to use the Laravel/Sanctum backend. If it
is omitted, the existing demo credentials remain available without a backend.

## What's implemented

- **Login** — split-panel design, email/password and Google sign-in authentication, validation states, password visibility toggle
- **Role-based shell** — collapsible sidebar (desktop) / drawer (mobile), header with search,
  notifications, and profile menu; navigation differs per role
- **Dashboards** — separate Principal, Manager, and Teacher dashboards with stats, charts,
  conflict banners, and recent activity
- **Master Timetable** — Class / Teacher / Room view modes, filters, print/export actions
- **Timetable Editor** — click-to-edit cells, subject/teacher/room selection, live mock clash
  detection, undo/redo, unsaved-change indicator, save
- **Auto-Generate wizard** — Select Scope → Constraints → Priorities → Review & Generate, followed
  by an animated generation-progress screen and a results screen with quality score and metrics
- **Conflicts** — summary cards, filterable table, resolution drawer (auto-resolve / ignore / view
  in editor)
- **Teachers / Classes / Subjects / Rooms** — searchable management tables, add/edit flows,
  teacher profile with a clickable weekly availability grid
- **Assignments** — teacher → subject → class → room builder with inline validation
- **Constraints** — hard/soft rules grouped by category, toggles, add-new-rule modal
- **Approval workflow** (Principal) — Draft → Generated → Under Review → Approved → Published,
  with a full timetable review drawer
- **Reports** (Principal) — workload, subject distribution, room utilization, conflict history
- **Notifications** — read/unread state, mark-all-read, delete
- **Responsive** — sidebar collapses to a mobile drawer, tables scroll horizontally, timetable
  grid stays readable on small screens

## Project structure

```
src/
├── components/
│   ├── layout/        Sidebar, Header, AppLayout
│   ├── navigation/     Role-based nav config
│   ├── dashboard/      Charts, activity feed
│   ├── timetable/      TimetableGrid, CellEditorDrawer, StepIndicator
│   ├── teachers/       AvailabilityGrid
│   └── common/         Button, Card, Badge, Toggle, Drawer/Modal, form controls
├── pages/
│   ├── auth/           Login
│   ├── principal/      Dashboard, ApprovalPage, ReportsPage
│   ├── manager/         Dashboard, Editor, GenerateWizard
│   ├── teacher/         Dashboard, Timetable, Classes, Profile
│   └── shared/          TimetableViewPage, ConflictsPage, ClassesPage, TeachersPage,
│                        SubjectsPage, RoomsPage, AssignmentsPage, ConstraintsPage,
│                        NotificationsPage, SettingsPage
├── data/               Centralized mock data (teachers, classes, subjects, rooms, etc.)
├── store/              Zustand stores (auth, app state, UI)
├── services/           mock*Service-style async functions — the seam for a future Laravel API
├── utils/              Timetable generator, teacher/room schedule derivation
└── routes/             ProtectedRoute (role guard)
```

## Backend

The Laravel backend lives beside this frontend in `../backend`. See `../backend/API_ENDPOINTS.md`
for the API contract. To run the backend locally, configure MySQL from `backend/.env.example`,
then run:

```bash
cd ../backend
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000
```

Demo accounts are `principal@alfalah.edu.pk`, `manager@alfalah.edu.pk`, and
`teacher@alfalah.edu.pk`, all with password `demo1234` in development seed data.

## Connecting additional backend data

`src/services/mockServices.js` exports functions like `getTimetable()`, `updateTimetableEntry()`,
`generateTimetable()`, `approveTimetable()`, etc. Each currently reads/writes the local Zustand
store with a simulated delay. Swapping to Laravel means replacing the body of each function with
a `fetch('/api/...')` call — no component code needs to change.
