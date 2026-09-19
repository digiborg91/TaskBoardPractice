# TaskBoard — Product Requirements & Verification Criteria

**Document Owner:** Product Management
**Status:** Approved for Development
**Version:** 1.0
**Last Updated:** 2026-09-18

---

## 1. Product Overview

### 1.1 Purpose

TaskBoard is a lightweight kanban-style task management web application that allows users to organize work across boards and columns (To Do, In Progress, Done). The application is designed to serve as a realistic practice target for automated testing — covering REST API testing, UI functional testing, and contract-based testing using Playwright.

### 1.2 Target Users

- Individual users who want a simple board-based task tracker
- SDETs and QA engineers using the application to practice web automation skills

### 1.3 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Backend API | Supabase Edge Functions (Deno) |
| Database | PostgreSQL (Supabase) |
| Authentication | Supabase Auth (email/password) |
| Hosting | Netlify (frontend) + Supabase (API + DB) |
| CI/CD | GitHub Actions |
| Test Framework | Playwright |

---

## 2. Glossary

| Term | Definition |
|------|-----------|
| Board | A named container for a set of tasks. A user can have multiple boards. |
| Task | A unit of work with a title, description, status, and priority. Belongs to exactly one board. |
| Column | A visual grouping of tasks by status: To Do, In Progress, or Done. |
| Status | The current state of a task. One of: `todo`, `in_progress`, `done`. |
| Priority | The urgency of a task. One of: `low`, `medium`, `high`. |
| RLS | Row-Level Security. Database-level policy ensuring users can only access their own data. |
| Auth Token | JWT access token issued by Supabase Auth on sign-in. Required for all API calls except health check. |

---

## 3. Functional Requirements

### 3.1 Authentication

| Req ID | Requirement | Priority |
|--------|------------|----------|
| AUTH-01 | A user shall be able to sign up with a valid email and password (min 6 characters). | Must |
| AUTH-02 | A user shall be able to sign in with registered email and password. | Must |
| AUTH-03 | A user shall be able to sign out from any page within the app. | Must |
| AUTH-04 | The system shall display an error message when sign-in fails (invalid credentials). | Must |
| AUTH-05 | The system shall display an error message when sign-up fails (email already registered). | Must |
| AUTH-06 | The system shall redirect unauthenticated users to the sign-in page. | Must |
| AUTH-07 | The system shall persist the user session across page reloads. | Must |
| AUTH-08 | The system shall display the authenticated user's email in the header. | Must |

### 3.2 Boards

| Req ID | Requirement | Priority |
|--------|------------|----------|
| BRD-01 | A user shall be able to create a new board with a title (required) and description (optional). | Must |
| BRD-02 | A user shall be able to view a list of their boards in the sidebar. | Must |
| BRD-03 | A user shall be able to select a board from the sidebar to view its tasks. | Must |
| BRD-04 | A user shall be able to edit a board's title and description. | Must |
| BRD-05 | A user shall be able to delete a board with a confirmation dialog. | Must |
| BRD-06 | Deleting a board shall cascade-delete all tasks belonging to that board. | Must |
| BRD-07 | The system shall display an empty state when no boards exist. | Must |
| BRD-08 | The system shall prevent creating a board with an empty title. | Must |
| BRD-09 | The currently active board shall be visually highlighted in the sidebar. | Must |

### 3.3 Tasks

| Req ID | Requirement | Priority |
|--------|------------|----------|
| TSK-01 | A user shall be able to create a task with a title (required), description (optional), status, and priority. | Must |
| TSK-02 | The default status for a new task shall be `todo` unless otherwise specified. | Must |
| TSK-03 | The default priority for a new task shall be `medium` unless otherwise specified. | Must |
| TSK-04 | A user shall be able to edit a task's title, description, and priority. | Must |
| TSK-05 | A user shall be able to edit a task's status via the edit form. | Must |
| TSK-06 | A user shall be able to delete a task with a confirmation dialog. | Must |
| TSK-07 | The system shall prevent creating a task with an empty title. | Must |
| TSK-08 | Tasks shall be displayed under the column matching their current status. | Must |
| TSK-09 | Each column shall display a count of tasks in that column. | Must |
| TSK-10 | A column with no tasks shall display an empty-state message. | Must |
| TSK-11 | The task priority shall be displayed as a colored badge on the task card. | Must |
| TSK-12 | A user shall be able to add a task directly to a specific column via the column's "+" button. | Must |

### 3.4 Kanban Board — Drag and Drop

| Req ID | Requirement | Priority |
|--------|------------|----------|
| DND-01 | A user shall be able to drag a task card from one column and drop it into another. | Must |
| DND-02 | When a task is dropped into a new column, its status shall update to match the target column. | Must |
| DND-03 | If the status update API call fails, the task shall revert to its original column. | Must |
| DND-04 | Column counts shall update after a drag-and-drop move. | Must |

### 3.5 Search

| Req ID | Requirement | Priority |
|--------|------------|----------|
| SRC-01 | A user shall be able to search/filter tasks by title within the active board. | Must |
| SRC-02 | The search shall be case-insensitive. | Must |
| SRC-03 | Clearing the search field shall restore the full task list. | Must |
| SRC-04 | When no tasks match the search query, the columns shall show empty states. | Should |

---

## 4. REST API Requirements

### 4.1 API Conventions

| Req ID | Requirement | Priority |
|--------|------------|----------|
| API-01 | All API endpoints shall return JSON responses. | Must |
| API-02 | All API endpoints (except `/api/health`) shall require a valid Bearer auth token. | Must |
| API-03 | Requests without a valid auth token shall receive a `401` response with an `error` field. | Must |
| API-04 | Requests to a non-existent endpoint shall receive a `404` response with an `error` field. | Must |
| API-05 | All responses shall include CORS headers (`Access-Control-Allow-Origin: *`). | Must |
| API-06 | `OPTIONS` preflight requests shall return `200` with CORS headers. | Must |
| API-07 | Validation errors shall return `400` with a descriptive `error` message. | Must |
| API-08 | Server errors shall return `500` with an `error` message. | Must |

### 4.2 Health Check

| Req ID | Endpoint | Method | Requirement | Priority |
|--------|----------|--------|------------|----------|
| HLT-01 | `/api/health` | GET | Shall return `200` without authentication. | Must |
| HLT-02 | `/api/health` | GET | Response shall contain `status: "ok"`, `service: "taskboard-api"`, `version`, and `endpoints` array. | Must |

### 4.3 Boards Endpoints

| Req ID | Endpoint | Method | Requirement | Priority |
|--------|----------|--------|------------|----------|
| BRD-API-01 | `/api/boards` | GET | Shall return `200` with a `boards` array of the user's boards, ordered by `created_at` descending. | Must |
| BRD-API-02 | `/api/boards` | GET | Shall return an empty `boards` array if the user has no boards. | Must |
| BRD-API-03 | `/api/boards` | POST | Shall create a board and return `201` with the created board object. | Must |
| BRD-API-04 | `/api/boards` | POST | Shall return `400` if `title` is missing, empty, or not a string. | Must |
| BRD-API-05 | `/api/boards` | POST | Response shall include `id`, `title`, `description`, `user_id`, `created_at`, `updated_at`. | Must |
| BRD-API-06 | `/api/boards/:id` | GET | Shall return `200` with the board object if the board exists and belongs to the user. | Must |
| BRD-API-07 | `/api/boards/:id` | GET | Shall return `404` if the board does not exist or does not belong to the user. | Must |
| BRD-API-08 | `/api/boards/:id` | PUT | Shall update the board and return `200` with the updated object. | Must |
| BRD-API-09 | `/api/boards/:id` | PUT | Shall return `400` if `title` is missing or empty. | Must |
| BRD-API-10 | `/api/boards/:id` | PUT | Shall return `404` if the board does not exist. | Must |
| BRD-API-11 | `/api/boards/:id` | DELETE | Shall delete the board and return `200` with `{ deleted: true, id }`. | Must |
| BRD-API-12 | `/api/boards/:id` | DELETE | Shall cascade-delete all tasks belonging to the board. | Must |

### 4.4 Tasks Endpoints

| Req ID | Endpoint | Method | Requirement | Priority |
|--------|----------|--------|------------|----------|
| TSK-API-01 | `/api/boards/:id/tasks` | GET | Shall return `200` with a `tasks` array ordered by `position` ascending. | Must |
| TSK-API-02 | `/api/boards/:id/tasks` | GET | Shall return an empty `tasks` array if the board has no tasks. | Must |
| TSK-API-03 | `/api/boards/:id/tasks` | POST | Shall create a task and return `201` with the created task object. | Must |
| TSK-API-04 | `/api/boards/:id/tasks` | POST | Shall return `400` if `title` is missing, empty, or not a string. | Must |
| TSK-API-05 | `/api/boards/:id/tasks` | POST | If `status` is omitted, shall default to `todo`. | Must |
| TSK-API-06 | `/api/boards/:id/tasks` | POST | If `priority` is omitted, shall default to `medium`. | Must |
| TSK-API-07 | `/api/boards/:id/tasks` | POST | If `status` is provided, shall validate it is one of: `todo`, `in_progress`, `done`. Invalid values shall fall back to `todo`. | Must |
| TSK-API-08 | `/api/boards/:id/tasks` | POST | If `priority` is provided, shall validate it is one of: `low`, `medium`, `high`. Invalid values shall fall back to `medium`. | Must |
| TSK-API-09 | `/api/tasks/:id` | GET | Shall return `200` with the task object if it exists and belongs to the user. | Must |
| TSK-API-10 | `/api/tasks/:id` | GET | Shall return `404` if the task does not exist. | Must |
| TSK-API-11 | `/api/tasks/:id` | PUT | Shall update the task and return `200` with the updated object. | Must |
| TSK-API-12 | `/api/tasks/:id` | PUT | Shall return `400` if `title` is provided but empty. | Must |
| TSK-API-13 | `/api/tasks/:id` | PUT | Shall return `400` if `priority` is provided but not a valid enum value. | Must |
| TSK-API-14 | `/api/tasks/:id` | PUT | Shall return `404` if the task does not exist. | Must |
| TSK-API-15 | `/api/tasks/:id` | PUT | Only provided fields shall be updated; omitted fields shall remain unchanged. | Must |
| TSK-API-16 | `/api/tasks/:id/status` | PATCH | Shall update the task status and return `200` with the updated task. | Must |
| TSK-API-17 | `/api/tasks/:id/status` | PATCH | Shall return `400` if `status` is missing or not a valid enum value. | Must |
| TSK-API-18 | `/api/tasks/:id/status` | PATCH | Shall return `404` if the task does not exist. | Must |
| TSK-API-19 | `/api/tasks/:id` | DELETE | Shall delete the task and return `200` with `{ deleted: true, id }`. | Must |

### 4.5 Contract / Schema Requirements

| Req ID | Requirement | Priority |
|--------|------------|----------|
| CTR-01 | The `Board` object shall always contain: `id` (uuid), `title` (string), `description` (string\|null), `user_id` (uuid), `created_at` (ISO datetime), `updated_at` (ISO datetime). | Must |
| CTR-02 | The `Task` object shall always contain: `id` (uuid), `title` (string), `description` (string\|null), `status` (enum), `priority` (enum), `position` (integer), `board_id` (uuid), `user_id` (uuid), `created_at` (ISO datetime), `updated_at` (ISO datetime). | Must |
| CTR-03 | The `BoardList` response shall be an object with a `boards` array. | Must |
| CTR-04 | The `TaskList` response shall be an object with a `tasks` array. | Must |
| CTR-05 | The `Error` response shall be an object with an `error` string field. | Must |
| CTR-06 | The `DeleteResponse` shall be an object with `deleted` (boolean) and `id` (string) fields. | Must |
| CTR-07 | All datetime fields shall conform to ISO 8601 format. | Must |
| CTR-08 | The `status` field shall only accept values: `todo`, `in_progress`, `done`. | Must |
| CTR-09 | The `priority` field shall only accept values: `low`, `medium`, `high`. | Must |
| CTR-10 | The full API contract is defined in `openapi.yaml`. | Must |

---

## 5. Non-Functional Requirements

| Req ID | Category | Requirement | Priority |
|--------|----------|------------|----------|
| NFR-01 | Security | All data access shall be enforced by Row-Level Security (RLS) policies at the database level. | Must |
| NFR-02 | Security | A user shall never be able to read, modify, or delete another user's boards or tasks. | Must |
| NFR-03 | Security | Passwords shall be managed by Supabase Auth; the app shall never store or transmit plaintext passwords. | Must |
| NFR-04 | Performance | The API shall respond to read requests within 2 seconds under normal load. | Should |
| NFR-05 | Usability | The UI shall be responsive and usable on mobile, tablet, and desktop viewports. | Must |
| NFR-06 | Usability | All interactive elements shall have visible hover and focus states. | Should |
| NFR-07 | Reliability | The UI shall display a visible error message when an API request fails. | Must |
| NFR-08 | Reliability | The drag-and-drop shall revert the task to its original position if the API call fails. | Must |
| NFR-09 | Accessibility | All interactive elements shall have `aria-label` attributes where no visible text label is present. | Should |
| NFR-10 | Testability | All interactive UI elements shall have `data-testid` attributes for stable test selectors. | Must |

---

## 6. Verification Criteria (Acceptance Criteria for Testing)

### 6.1 Authentication — Verification Criteria

| VC ID | Req Ref | Scenario | Given | When | Then | Test Type |
|-------|---------|----------|-------|------|------|-----------|
| VC-AUTH-01 | AUTH-01 | Successful sign-up | A new user is on the sign-up form | They enter a valid email and password (min 6 chars) and submit | The account is created and they are redirected to the board page | UI |
| VC-AUTH-02 | AUTH-05 | Sign-up with existing email | A user with email `test@example.com` already exists | A new user signs up with the same email | An error message is displayed indicating the email is already registered | UI |
| VC-AUTH-03 | AUTH-02 | Successful sign-in | A registered user is on the sign-in form | They enter correct email and password and submit | They are redirected to the board page | UI |
| VC-AUTH-04 | AUTH-04 | Sign-in with wrong password | A registered user is on the sign-in form | They enter correct email but wrong password | An error message is displayed | UI |
| VC-AUTH-05 | AUTH-04 | Sign-in with non-existent email | A user is on the sign-in form | They enter an email that has no account | An error message is displayed | UI |
| VC-AUTH-06 | AUTH-08 | User email displayed | A user is signed in | They view the app header | Their email address is visible | UI |
| VC-AUTH-07 | AUTH-03 | Sign out | A user is signed in and viewing boards | They click the Sign Out button | They are redirected to the sign-in page | UI |
| VC-AUTH-08 | AUTH-06 | Unauthenticated access | A user is not signed in | They navigate to the app URL | They see the sign-in/sign-up page | UI |
| VC-AUTH-09 | AUTH-07 | Session persistence | A user is signed in | They reload the page | They remain signed in and see the board page | UI |
| VC-AUTH-10 | AUTH-01 | Sign-up validation — short password | A new user is on the sign-up form | They enter a valid email but a 5-character password | The form prevents submission (HTML minLength validation) | UI |

### 6.2 Boards — Verification Criteria

| VC ID | Req Ref | Scenario | Given | When | Then | Test Type |
|-------|---------|----------|-------|------|------|-----------|
| VC-BRD-01 | BRD-01 | Create a board via UI | A user is signed in and has no boards | They click "Create Your First Board", enter a title, and submit | The board appears in the sidebar and becomes the active board | UI |
| VC-BRD-02 | BRD-01 | Create a board via API | A valid auth token is available | A POST request is sent to `/api/boards` with a valid title | A `201` response is returned with the created board object | API |
| VC-BRD-03 | BRD-API-04 | Create board with empty title via API | A valid auth token is available | A POST request is sent with an empty or missing `title` | A `400` response is returned with a descriptive error message | API |
| VC-BRD-04 | BRD-02 | List boards via API | A user has 3 boards | A GET request is sent to `/api/boards` | A `200` response is returned with a `boards` array of length 3 | API |
| VC-BRD-05 | BRD-API-02 | List boards — empty | A user has no boards | A GET request is sent to `/api/boards` | A `200` response is returned with an empty `boards` array | API |
| VC-BRD-06 | BRD-04 | Edit a board via UI | A user has a board named "Sprint 1" | They click the edit icon, change the title to "Sprint 1A", and save | The board title updates in the sidebar and main area | UI |
| VC-BRD-07 | BRD-API-08 | Update board via API | A board exists | A PUT request is sent with a new title | A `200` response is returned with the updated board object | API |
| VC-BRD-08 | BRD-API-10 | Update non-existent board via API | A valid auth token is available | A PUT request is sent to `/api/boards/{invalid-uuid}` | A `404` response is returned | API |
| VC-BRD-09 | BRD-05, BRD-06 | Delete a board via UI | A user has a board with tasks | They click the delete icon and confirm | The board and all its tasks are removed from the UI | UI |
| VC-BRD-10 | BRD-API-12 | Delete board cascades tasks via API | A board has 3 tasks | A DELETE request is sent for the board, then a GET for tasks | The board deletion returns `200`; the tasks GET returns an empty array (or the board is not found) | API |
| VC-BRD-11 | BRD-07 | Empty state — no boards | A signed-in user has no boards | They view the board main area | An empty state message and "Create Your First Board" button are displayed | UI |
| VC-BRD-12 | BRD-09 | Active board highlighted | A user has multiple boards | They click a board in the sidebar | That board is visually highlighted as active | UI |
| VC-BRD-13 | BRD-API-07 | Get board — not found | A valid auth token is available | A GET request is sent to `/api/boards/{non-existent-id}` | A `404` response is returned with an error message | API |

### 6.3 Tasks — Verification Criteria

| VC ID | Req Ref | Scenario | Given | When | Then | Test Type |
|-------|---------|----------|-------|------|------|-----------|
| VC-TSK-01 | TSK-01 | Create a task via UI | A user has an active board | They click "+" on a column, fill in the task form, and submit | The task appears in the correct column | UI |
| VC-TSK-02 | TSK-API-03 | Create a task via API | A board exists | A POST request is sent with a valid title | A `201` response is returned with the created task object | API |
| VC-TSK-03 | TSK-API-04 | Create task with empty title via API | A board exists | A POST request is sent with an empty or missing `title` | A `400` response is returned with a descriptive error | API |
| VC-TSK-04 | TSK-API-05 | Default status is todo | A board exists | A POST request is sent with only a title (no status) | The returned task has `status: "todo"` | API |
| VC-TSK-05 | TSK-API-06 | Default priority is medium | A board exists | A POST request is sent with only a title (no priority) | The returned task has `priority: "medium"` | API |
| VC-TSK-06 | TSK-API-07 | Invalid status falls back to todo | A board exists | A POST request is sent with `status: "invalid"` | The returned task has `status: "todo"` | API |
| VC-TSK-07 | TSK-API-08 | Invalid priority falls back to medium | A board exists | A POST request is sent with `priority: "invalid"` | The returned task has `priority: "medium"` | API |
| VC-TSK-08 | TSK-04 | Edit a task via UI | A task "Fix bug" exists | The user clicks edit, changes the title to "Fix login bug", and saves | The task title updates on the card | UI |
| VC-TSK-09 | TSK-API-11 | Update task via API | A task exists | A PUT request is sent with a new title and priority | A `200` response is returned with the updated task | API |
| VC-TSK-10 | TSK-API-15 | Partial update — omitted fields unchanged | A task has title "A" and priority "high" | A PUT request is sent with only `{ description: "new" }` | The returned task still has title "A" and priority "high" | API |
| VC-TSK-11 | TSK-API-14 | Update non-existent task via API | A valid auth token is available | A PUT request is sent to `/api/tasks/{non-existent-id}` | A `404` response is returned | API |
| VC-TSK-12 | TSK-API-13 | Update task with invalid priority | A task exists | A PUT request is sent with `priority: "urgent"` | A `400` response is returned with a descriptive error | API |
| VC-TSK-13 | TSK-06 | Delete a task via UI | A task exists on the board | The user clicks the delete icon and confirms | The task is removed from the board | UI |
| VC-TSK-14 | TSK-API-19 | Delete task via API | A task exists | A DELETE request is sent to `/api/tasks/{id}` | A `200` response is returned with `{ deleted: true, id }` | API |
| VC-TSK-15 | TSK-API-01 | List tasks via API | A board has 5 tasks | A GET request is sent to `/api/boards/{id}/tasks` | A `200` response is returned with a `tasks` array of length 5 | API |
| VC-TSK-16 | TSK-API-02 | List tasks — empty board | A board has no tasks | A GET request is sent to `/api/boards/{id}/tasks` | A `200` response is returned with an empty `tasks` array | API |
| VC-TSK-17 | TSK-API-09 | Get single task via API | A task exists | A GET request is sent to `/api/tasks/{id}` | A `200` response is returned with the task object | API |
| VC-TSK-18 | TSK-API-10 | Get non-existent task via API | A valid auth token is available | A GET request is sent to `/api/tasks/{non-existent-id}` | A `404` response is returned | API |
| VC-TSK-19 | TSK-09 | Column count displays correctly | A board has 2 todo, 1 in_progress, 3 done tasks | The user views the board | The column counts show 2, 1, 3 respectively | UI |
| VC-TSK-20 | TSK-10 | Empty column message | A board has tasks only in "todo" | The user views the "done" column | An "No tasks" empty state is displayed | UI |
| VC-TSK-21 | TSK-11 | Priority badge displayed | A task with priority "high" exists | The user views the task card | A red "high" badge is visible on the card | UI |
| VC-TSK-22 | TSK-12 | Add task to specific column | A user is viewing the board | They click "+" on the "Done" column and create a task | The task is created with status "done" and appears in the Done column | UI |

### 6.4 Drag and Drop — Verification Criteria

| VC ID | Req Ref | Scenario | Given | When | Then | Test Type |
|-------|---------|----------|-------|------|------|-----------|
| VC-DND-01 | DND-01, DND-02 | Drag task from To Do to In Progress | A task is in the To Do column | The user drags it to the In Progress column and drops | The task moves to the In Progress column and its status updates to `in_progress` | UI |
| VC-DND-02 | DND-01, DND-02 | Drag task from In Progress to Done | A task is in the In Progress column | The user drags it to the Done column and drops | The task moves to the Done column and its status updates to `done` | UI |
| VC-DND-03 | DND-04 | Column counts update after drag | A board has 2 tasks in todo, 0 in done | The user drags one task from todo to done | The todo count becomes 1 and the done count becomes 1 | UI |
| VC-DND-04 | DND-03 | Revert on API failure | A task is being dragged | The API call to update status fails | The task reverts to its original column | UI |
| VC-DND-05 | DND-02 | Status update via API | A task exists with status `todo` | A PATCH request is sent to `/api/tasks/{id}/status` with `{ status: "done" }` | A `200` response is returned with the task having `status: "done"` | API |
| VC-DND-06 | TSK-API-17 | Status update with invalid value via API | A task exists | A PATCH request is sent with `{ status: "archived" }` | A `400` response is returned with a descriptive error | API |
| VC-DND-07 | TSK-API-17 | Status update with missing status field | A task exists | A PATCH request is sent with an empty body | A `400` response is returned with a descriptive error | API |
| VC-DND-08 | TSK-API-18 | Status update on non-existent task | A valid auth token is available | A PATCH request is sent to `/api/tasks/{non-existent-id}/status` | A `404` response is returned | API |

### 6.5 Search — Verification Criteria

| VC ID | Req Ref | Scenario | Given | When | Then | Test Type |
|-------|---------|----------|-------|------|------|-----------|
| VC-SRC-01 | SRC-01 | Search filters tasks by title | A board has tasks "Fix bug", "Add tests", "Deploy" | The user types "bug" in the search field | Only the "Fix bug" task is visible | UI |
| VC-SRC-02 | SRC-02 | Search is case-insensitive | A board has a task "Fix Bug" | The user types "fix bug" in the search field | The "Fix Bug" task is visible | UI |
| VC-SRC-03 | SRC-03 | Clearing search restores all tasks | A search filter is active showing 1 of 3 tasks | The user clears the search field | All 3 tasks are visible again | UI |
| VC-SRC-04 | SRC-04 | No search results shows empty columns | A board has tasks "Fix bug", "Add tests" | The user types "xyz" in the search field | All columns show the empty state message | UI |

### 6.6 API Security — Verification Criteria

| VC ID | Req Ref | Scenario | Given | When | Then | Test Type |
|-------|---------|----------|-------|------|------|-----------|
| VC-SEC-01 | API-02, API-03 | No auth token | No auth token is provided | A GET request is sent to `/api/boards` | A `401` response is returned | API |
| VC-SEC-02 | API-02, API-03 | Invalid auth token | An invalid/expired token is provided | A GET request is sent to `/api/boards` | A `401` response is returned | API |
| VC-SEC-03 | NFR-02 | Cross-user board access | User A has a board; User B is authenticated | User B sends a GET to `/api/boards/{user-a-board-id}` | A `404` response is returned (User B cannot see User A's board) | API |
| VC-SEC-04 | NFR-02 | Cross-user task access | User A has a task; User B is authenticated | User B sends a GET to `/api/tasks/{user-a-task-id}` | A `404` response is returned | API |
| VC-SEC-05 | NFR-02 | Cross-user board delete | User A has a board; User B is authenticated | User B sends a DELETE to `/api/boards/{user-a-board-id}` | The board is not deleted; User A's board remains intact | API |
| VC-SEC-06 | HLT-01 | Health check without auth | No auth token is provided | A GET request is sent to `/api/health` | A `200` response is returned | API |

### 6.7 API Error Handling — Verification Criteria

| VC ID | Req Ref | Scenario | Given | When | Then | Test Type |
|-------|---------|----------|-------|------|------|-----------|
| VC-ERR-01 | API-04 | Non-existent endpoint | A valid auth token is available | A GET request is sent to `/api/nonexistent` | A `404` response is returned with an `error` field | API |
| VC-ERR-02 | API-07 | Create board with non-string title | A valid auth token is available | A POST request is sent with `{ title: 123 }` | A `400` response is returned | API |
| VC-ERR-03 | API-07 | Create task with non-string title | A board exists | A POST request is sent with `{ title: 123 }` | A `400` response is returned | API |
| VC-ERR-04 | API-08 | Server error response format | A server error occurs | Any request triggers a 500 | The response body contains an `error` string field | API |

### 6.8 Contract Testing — Verification Criteria

| VC ID | Req Ref | Scenario | Given | When | Then | Test Type |
|-------|---------|----------|-------|------|------|-----------|
| VC-CTR-01 | CTR-01 | Board object schema | A GET `/api/boards` response is received | The response is validated against the `BoardList` schema in `openapi.yaml` | All required fields are present with correct types | Contract |
| VC-CTR-02 | CTR-02 | Task object schema | A GET `/api/boards/:id/tasks` response is received | The response is validated against the `TaskList` schema in `openapi.yaml` | All required fields are present with correct types | Contract |
| VC-CTR-03 | CTR-03 | BoardList wrapper | A GET `/api/boards` response is received | The response is checked | It is an object with a `boards` array property | Contract |
| VC-CTR-04 | CTR-04 | TaskList wrapper | A GET `/api/boards/:id/tasks` response is received | The response is checked | It is an object with a `tasks` array property | Contract |
| VC-CTR-05 | CTR-05 | Error response schema | A 400/404/401/500 response is received | The response body is checked | It is an object with an `error` string property | Contract |
| VC-CTR-06 | CTR-06 | Delete response schema | A DELETE request succeeds | The response body is checked | It is an object with `deleted` (boolean) and `id` (string) properties | Contract |
| VC-CTR-07 | CTR-07 | Datetime format | Any response with `created_at` or `updated_at` is received | The datetime fields are checked | They conform to ISO 8601 format (`YYYY-MM-DDTHH:mm:ss.sssZ`) | Contract |
| VC-CTR-08 | CTR-08 | Status enum validation | A task object is received | The `status` field is checked | It is one of: `todo`, `in_progress`, `done` | Contract |
| VC-CTR-09 | CTR-09 | Priority enum validation | A task object is received | The `priority` field is checked | It is one of: `low`, `medium`, `high` | Contract |
| VC-CTR-10 | CTR-01 | Board created response schema | A POST `/api/boards` succeeds with `201` | The response body is validated against the `Board` schema | All required fields (`id`, `title`, `user_id`, `created_at`, `updated_at`) are present with correct types | Contract |
| VC-CTR-11 | CTR-02 | Task created response schema | A POST `/api/boards/:id/tasks` succeeds with `201` | The response body is validated against the `Task` schema | All required fields are present with correct types | Contract |
| VC-CTR-12 | CTR-02 | Task status update response schema | A PATCH `/api/tasks/:id/status` succeeds with `200` | The response body is validated against the `Task` schema | The `status` field matches the requested value; all required fields are present | Contract |
| VC-CTR-13 | HLT-02 | Health check schema | A GET `/api/health` response is received | The response is validated against the `HealthResponse` schema | `status`, `service`, `version`, and `endpoints` fields are present with correct types | Contract |

---

## 7. Test Data Requirements

### 7.1 Test Users

| Role | Email Pattern | Purpose |
|------|--------------|---------|
| Primary test user | `testuser+1@example.com` | Main UI and API tests |
| Secondary test user | `testuser+2@example.com` | Cross-user security tests (VC-SEC-03 through VC-SEC-05) |
| Password | `TestPass123!` | Minimum 6 characters, meets Supabase requirements |

### 7.2 Test Data Setup

Each test run should start with a clean state for the test user. Recommended approach:

1. Sign in as the test user
2. Delete all existing boards (cleanup)
3. Create known test boards and tasks as needed by the test
4. Run assertions
5. Clean up after test (delete all boards)

For API tests, use Playwright's `request` fixture with the auth token obtained from signing in.

---

## 8. Test Organization Recommendations

| Directory | Test Type | Description |
|-----------|-----------|-------------|
| `tests/ui/auth.spec.ts` | UI | Authentication flows (VC-AUTH-01 through VC-AUTH-10) |
| `tests/ui/boards.spec.ts` | UI | Board CRUD and sidebar interactions (VC-BRD-01, 06, 09, 11, 12) |
| `tests/ui/tasks.spec.ts` | UI | Task CRUD and column display (VC-TSK-01, 08, 13, 19, 20, 21, 22) |
| `tests/ui/drag-drop.spec.ts` | UI | Drag and drop flows (VC-DND-01 through VC-DND-04) |
| `tests/ui/search.spec.ts` | UI | Search/filter functionality (VC-SRC-01 through VC-SRC-04) |
| `tests/api/boards.spec.ts` | API | Board API endpoints (VC-BRD-02 through VC-BRD-13) |
| `tests/api/tasks.spec.ts` | API | Task API endpoints (VC-TSK-02 through VC-TSK-18) |
| `tests/api/auth.spec.ts` | API | Auth and security tests (VC-SEC-01 through VC-SEC-06, VC-ERR-01 through VC-ERR-04) |
| `tests/api/health.spec.ts` | API | Health check (VC-CTR-13, HLT-01, HLT-02) |
| `tests/contract/boards.contract.spec.ts` | Contract | Board schema validation (VC-CTR-01, 03, 10) |
| `tests/contract/tasks.contract.spec.ts` | Contract | Task schema validation (VC-CTR-02, 04, 11, 12) |
| `tests/contract/errors.contract.spec.ts` | Contract | Error and delete response schemas (VC-CTR-05, 06) |
| `tests/contract/enums.contract.spec.ts` | Contract | Enum and format validation (VC-CTR-07, 08, 09) |

---

## 9. CI/CD Integration

| Req ID | Requirement | Priority |
|--------|------------|----------|
| CI-01 | Playwright tests shall run automatically on every push to `main`/`master`. | Must |
| CI-02 | Playwright tests shall run automatically on every pull request to `main`/`master`. | Must |
| CI-03 | The HTML test report shall be uploaded as a GitHub Actions artifact with 30-day retention. | Must |
| CI-04 | Test results (traces, screenshots, videos) shall be uploaded as a GitHub Actions artifact with 30-day retention. | Must |
| CI-05 | The CI workflow shall use Node.js 20. | Must |
| CI-06 | The following secrets shall be configured in the GitHub repository: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. | Must |
| CI-07 | Tests shall run on Chromium in CI. | Must |

---

## 10. UI Element Locator Reference

All interactive elements include `data-testid` attributes. The full list is documented in the project `README.md`. Key selectors for test authors:

| Element | data-testid |
|---------|-------------|
| Email input field | `email-input` |
| Password input field | `password-input` |
| Auth submit button | `auth-submit` |
| Auth error message | `auth-error` |
| Toggle to sign up | `toggle-signup` |
| Toggle to sign in | `toggle-signin` |
| Sign out button | `signout-btn` |
| User email display | `user-email` |
| App header | `app-header` |
| Sidebar | `sidebar` |
| Board list | `board-list` |
| New board button | `new-board-btn` |
| Board item | `board-item-{id}` |
| Board edit button | `board-edit-{id}` |
| Board delete button | `board-delete-{id}` |
| Active board title | `active-board-title` |
| Search input | `search-input` |
| Kanban board container | `kanban-board` |
| Column (To Do) | `column-todo` |
| Column (In Progress) | `column-in_progress` |
| Column (Done) | `column-done` |
| Column task count | `column-count-{status}` |
| Column empty state | `column-empty-{status}` |
| Add task button (per column) | `add-task-{status}` |
| Task card | `task-card-{id}` |
| Task title | `task-title-{id}` |
| Task priority badge | `task-priority-{id}` |
| Task edit button | `task-edit-{id}` |
| Task delete button | `task-delete-{id}` |
| Board modal | `board-modal` |
| Board title input | `board-title-input` |
| Board description input | `board-description-input` |
| Board save button | `board-save` |
| Board cancel button | `board-cancel` |
| Task modal | `task-modal` |
| Task title input | `task-title-input` |
| Task description input | `task-description-input` |
| Task status select | `task-status-select` |
| Task priority select | `task-priority-select` |
| Task save button | `task-save` |
| Task cancel button | `task-cancel` |
| Modal overlay | `modal-overlay` |
| Modal close button | `modal-close` |
| App error banner | `app-error` |
| No board empty state | `no-board-state` |
| Create first board button | `create-first-board` |

---

## 11. API Endpoint Quick Reference

| Method | Endpoint | Auth | Success | Description |
|--------|----------|------|---------|-------------|
| GET | `/api/health` | No | 200 | Health check |
| GET | `/api/boards` | Yes | 200 | List user's boards |
| POST | `/api/boards` | Yes | 201 | Create a board |
| GET | `/api/boards/:id` | Yes | 200 | Get a board |
| PUT | `/api/boards/:id` | Yes | 200 | Update a board |
| DELETE | `/api/boards/:id` | Yes | 200 | Delete a board |
| GET | `/api/boards/:id/tasks` | Yes | 200 | List tasks on a board |
| POST | `/api/boards/:id/tasks` | Yes | 201 | Create a task |
| GET | `/api/tasks/:id` | Yes | 200 | Get a task |
| PUT | `/api/tasks/:id` | Yes | 200 | Update a task |
| PATCH | `/api/tasks/:id/status` | Yes | 200 | Update task status |
| DELETE | `/api/tasks/:id` | Yes | 200 | Delete a task |

---

## 12. Out of Scope (v1)

The following are intentionally excluded from v1 to keep the app focused as a testing practice target:

- Multi-user collaboration on shared boards
- Task assignment to other users
- Task due dates and reminders
- File attachments
- Activity history / audit log
- Board templates
- Custom columns (beyond todo/in_progress/done)
- Offline mode
- Mobile native app
- Social authentication (Google, GitHub, etc.)
- Password reset flow
- Email verification

These can be added as v2 enhancements if the testing scope needs to expand.
