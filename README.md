# TaskBoard — Kanban Task Manager

A Trello-lite kanban board app designed for practicing web automation with Playwright.
Includes REST API endpoints, UI interactions, and an OpenAPI spec for contract-based testing.

## Features

- **User authentication** — sign up / sign in with email + password
- **Boards** — create, edit, delete, and switch between multiple boards
- **Tasks** — create, edit, delete tasks with title, description, status, and priority
- **Kanban columns** — To Do, In Progress, Done — drag and drop tasks between columns
- **Search** — filter tasks by title within a board
- **REST API** — full CRUD via Supabase Edge Functions (see below)

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Supabase (database, auth, edge functions)
- **Hosting:** Netlify (static site) + Supabase (API + database)
- **Testing:** Playwright (UI tests, API tests, contract tests)

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## REST API Endpoints

Base URL (production): `https://lhpqgcdtcxotskoqyweh.supabase.co/functions/v1/api`
Base URL (local dev): proxied through Netlify redirect at `/api/*`

All endpoints (except `/api/health`) require:
```
Authorization: Bearer <supabase_session_access_token>
```

### Health Check
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | API health check (no auth) |

### Boards
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/boards` | List all boards for the authenticated user |
| POST | `/api/boards` | Create a new board |
| GET | `/api/boards/:id` | Get a single board |
| PUT | `/api/boards/:id` | Update a board |
| DELETE | `/api/boards/:id` | Delete a board (cascades to tasks) |

### Tasks
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/boards/:id/tasks` | List all tasks on a board |
| POST | `/api/boards/:id/tasks` | Create a task on a board |
| GET | `/api/tasks/:id` | Get a single task |
| PUT | `/api/tasks/:id` | Update a task (title, description, priority) |
| PATCH | `/api/tasks/:id/status` | Update task status (move between columns) |
| DELETE | `/api/tasks/:id` | Delete a task |

### Request/Response Examples

**Create a board:**
```http
POST /api/boards
Content-Type: application/json
Authorization: Bearer <token>

{ "title": "Sprint 42", "description": "Q4 planning" }
```

Response (201):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Sprint 42",
  "description": "Q4 planning",
  "user_id": "...",
  "created_at": "2026-09-18T10:00:00Z",
  "updated_at": "2026-09-18T10:00:00Z"
}
```

**Create a task:**
```http
POST /api/boards/550e8400.../tasks
Content-Type: application/json
Authorization: Bearer <token>

{ "title": "Fix login bug", "status": "todo", "priority": "high" }
```

**Move task status:**
```http
PATCH /api/tasks/abc123.../status
Content-Type: application/json
Authorization: Bearer <token>

{ "status": "in_progress" }
```

## Playwright Test Setup

The repo includes a `playwright.config.ts` ready for your tests.

### Install Playwright

```bash
npm init playwright@latest
# Choose: TypeScript, tests folder, install browsers
```

Or manually:
```bash
npm install -D @playwright/test
npx playwright install
```

### Test Categories to Practice

1. **UI Tests** (`tests/ui/`)
   - Auth flow: sign up, sign in, sign out, invalid credentials
   - Board CRUD: create, edit, delete boards via the UI
   - Task CRUD: create, edit, delete tasks
   - Drag and drop tasks between columns
   - Search/filter tasks
   - Empty states (no boards, no tasks)
   - Form validation (empty title, etc.)

2. **API Tests** (`tests/api/`)
   - Use Playwright's `request` fixture with the auth token
   - Test all CRUD endpoints for boards and tasks
   - Test validation errors (400s)
   - Test unauthorized access (401)
   - Test not-found cases (404)
   - Test health check endpoint

3. **Contract Tests** (`tests/contract/`)
   - Validate API responses against `openapi.yaml`
   - Use a JSON schema validator to assert response shapes
   - Example: assert every `GET /api/boards` response matches the `BoardList` schema

### CI/CD with GitHub Actions

The workflow at `.github/workflows/playwright-tests.yml` runs on every push to `main`/`master` and on PRs:

1. Installs dependencies and Playwright browsers
2. Runs `npx playwright test`
3. Uploads the HTML report and test results as artifacts (30-day retention)

**Required GitHub Secrets:**
- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon key

The report is available as a downloadable artifact in the Actions tab.

## Deploying to Netlify

1. Push this repo to GitHub
2. In Netlify, create a new site from the GitHub repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables in Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy

The `netlify.toml` includes a redirect rule that proxies `/api/*` to the Supabase Edge Function, so your Playwright tests can hit the same origin.

## Project Structure

```
taskboard/
├── src/
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Supabase client, API client, auth context
│   ├── pages/            # Page-level components (Auth, Board)
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Entry point
│   └── styles.css        # Global styles
├── supabase/
│   ├── functions/api/    # REST API edge function
│   ├── config.toml       # Supabase config
│   └── migrations/       # Database migrations
├── .github/workflows/    # CI/CD (Playwright tests)
├── openapi.yaml          # OpenAPI spec for contract testing
├── playwright.config.ts  # Playwright configuration
├── netlify.toml          # Netlify deploy config + API proxy
├── vite.config.ts        # Vite configuration
└── package.json
```

## Data-testid Attributes

The UI includes `data-testid` attributes throughout for stable Playwright selectors:

- `auth-error`, `email-input`, `password-input`, `auth-submit`
- `toggle-signup`, `toggle-signin`
- `app-header`, `sidebar`, `board-list`, `board-main`
- `new-board-btn`, `board-item-{id}`, `board-edit-{id}`, `board-delete-{id}`
- `active-board-title`, `search-input`
- `column-todo`, `column-in_progress`, `column-done`
- `column-count-{status}`, `column-empty-{status}`, `add-task-{status}`
- `task-card-{id}`, `task-title-{id}`, `task-priority-{id}`
- `task-edit-{id}`, `task-delete-{id}`
- `board-modal`, `board-title-input`, `board-save`, `board-cancel`
- `task-modal`, `task-title-input`, `task-status-select`, `task-priority-select`, `task-save`, `task-cancel`
- `signout-btn`, `user-email`, `app-error`, `modal-overlay`, `modal-close`
- `create-first-board`, `no-board-state`, `kanban-board`, `board-toolbar`
