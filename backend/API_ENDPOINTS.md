# TimeTablePro API

Base URL: `http://localhost:8000/api/v1`

## Authentication

The React SPA uses Laravel Sanctum cookies. Call `GET /sanctum/csrf-cookie` before `POST /auth/login`, then send requests with credentials.

| Method | Endpoint | Access |
|---|---|---|
| POST | `/auth/login` | Public |
| POST | `/auth/logout` | Authenticated |
| GET | `/auth/user` | Authenticated |
| GET | `/dashboard` | Authenticated |
| GET | `/{resource}` | Authenticated |
| GET | `/timetables` | Authenticated |
| GET | `/timetables/{id}` | Authenticated |
| POST | `/timetables/validate-entry` | Authenticated |
| POST | `/timetables/{id}/entries` | Principal, manager |
| PUT/PATCH | `/timetable-entries/{id}` | Principal, manager |
| DELETE | `/timetable-entries/{id}` | Principal, manager |
| POST | `/timetables/{id}/submit` | Manager |
| POST | `/timetables/{id}/request-changes` | Principal |
| POST | `/timetables/{id}/approve` | Principal |
| POST | `/timetables/{id}/publish` | Principal |
| GET | `/conflicts` | Authenticated |
| POST | `/conflicts/{id}/resolve` | Principal, manager |
| GET | `/notifications` | Authenticated |
| POST | `/notifications/read-all` | Authenticated |
| GET | `/reports/teacher-workload` | Authenticated |
| GET | `/reports/subject-distribution` | Authenticated |
| GET | `/reports/room-utilization` | Authenticated |

Resources currently include `teachers`, `classes`, `subjects`, `rooms`, `periods`, and `academic-years`.

All responses use `{ success, message?, data? }`. Validation failures return HTTP 422 and authorization failures return HTTP 403.
