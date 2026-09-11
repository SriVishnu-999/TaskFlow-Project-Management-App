# TaskFlow — Enterprise Agile & Task Management Platform

[![.NET 9.0](https://img.shields.io/badge/.NET-9.0-512bd4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React 19](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![Entity Framework Core](https://img.shields.io/badge/EF%20Core-9.0-blue)](https://learn.microsoft.com/en-us/ef/core/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-LocalDB-CC292B?logo=microsoft-sql-server)](https://www.microsoft.com/en-us/sql-server)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

**TaskFlow** is a modern, enterprise-grade project management application designed to emulate core workflows found in platforms like Jira and Trello. It demonstrates end-to-end full-stack engineering proficiency across **ASP.NET Core 9.0 Web API, Entity Framework Core, Microsoft SQL Server, and React.js**.

---

## 🏗️ Architectural Overview (Clean Architecture)

The backend is organized according to **Clean Architecture** and **SOLID design principles**, separating business domain logic from infrastructure details and API transport:

```
TaskFlow/
├── backend/
│   ├── src/
│   │   ├── TaskFlow.Core/             # [Domain Layer] Entities, Enums, BaseEntity, Interfaces
│   │   │   ├── Entities/              # User, Project, Board, BoardColumn, ProjectTask, TaskActivity
│   │   │   ├── Enums/                 # TaskPriority, TaskItemStatus, ProjectRole
│   │   │   └── Interfaces/            # IRepository<T>, IUnitOfWork, ICurrentUserService
│   │   ├── TaskFlow.Application/      # [Business Logic] DTOs, Service Interfaces, Result Pattern
│   │   │   ├── DTOs/                  # Auth, Project, Board, Task, Analytics Data Contracts
│   │   │   ├── Interfaces/            # IAuthService, IProjectService, IBoardService, ITaskService
│   │   │   └── Common/                # Result<T> pattern, AppException hierarchy
│   │   ├── TaskFlow.Infrastructure/   # [Persistence & Security] EF Core, DbContext, JWT, BCrypt
│   │   │   ├── Data/                  # TaskFlowDbContext, DbInitializer (Seed Data)
│   │   │   ├── Repositories/          # Generic Repository & UnitOfWork implementations
│   │   │   └── Services/              # AuthService, ProjectService, BoardService, TaskService, AnalyticsService
│   │   └── TaskFlow.Api/              # [Presentation Layer] ASP.NET Core Web API Controllers & Middleware
│   │       ├── Controllers/           # Auth, Projects, Boards, Tasks, Analytics Controllers
│   │       ├── Middleware/            # GlobalExceptionMiddleware (standardized error envelopes)
│   │       └── Program.cs             # DI configuration, JWT Bearer Auth, Swagger OpenAPI with JWT UI
├── frontend/                          # Modern React 19 + Tailwind CSS + Lucide Icons
│   ├── src/
│   │   ├── api/                       # Axios client instance with JWT request/response interceptors
│   │   ├── context/                   # AuthContext & ProjectContext state providers
│   │   ├── components/
│   │   │   ├── kanban/                # KanbanBoard, KanbanColumn, TaskCard, CreateTaskModal, TaskDetailModal
│   │   │   ├── dashboard/             # DashboardView (Velocity, Burndown, Priority breakdown)
│   │   │   ├── common/                # Navbar, Sidebar, Modal, PriorityBadge, StatusBadge
│   │   │   └── auth/                  # AuthPage with 1-Click Instant Demo Login
└── run.bat                            # 1-Click launcher to boot API & UI simultaneously
```

---

## ✨ Key Features

1. **Interactive Drag-and-Drop Kanban Board**:
   - Multi-column lifecycle (*Backlog*, *To Do*, *In Progress*, *In Review*, *Done*).
   - Optimistic UI updates for immediate feedback on task transitions.
   - Column-level quick add and card drop zones with hover indicator.
2. **Task Velocity & Productivity Dashboard**:
   - Sprint completion percentage and story points delivered vs total estimated.
   - Real-time priority breakdown (Urgent, High, Medium, Low) and overdue item tracking.
   - Chronological engineering activity audit feed.
3. **Task Lifecycle & Audit Trail**:
   - Auto-generated task keys (e.g. `TF-101`, `TF-102`).
   - Detailed task modal for updating titles, descriptions, story points, due dates, tags, and assignees.
   - Every movement and update records an entry into `TaskActivities` table for audit compliance.
4. **Relational Database Design**:
   - Microsoft SQL Server LocalDB (`(localdb)\mssqllocaldb`) with automatic table creation, foreign keys, and indexes.
   - Automatic audit timestamps (`CreatedAt`, `UpdatedAt`) handled via EF Core ChangeTracker.
   - Zero-config portable fallback to SQLite available via configuration switch.
5. **Secure Authentication & Token Management**:
   - JWT (JSON Web Tokens) with claims validation, expiration, and password hashing via BCrypt.
   - Protected API controllers with `[Authorize]`.
   - Frontend Axios interceptors automatically attach tokens and handle 401 expiration.
6. **Developer Experience & Swagger**:
   - Swagger / OpenAPI interactive UI enabled with "Authorize" button to test endpoints.
   - Pre-seeded database with realistic software engineering tasks and 4 user personas.

---

## 🚀 Quick Start Guide

### Option 1: 1-Click Launch (Recommended for Windows)
Simply double click `run.bat` in the project root:
```cmd
run.bat
```
This boots both the .NET 9 API and Vite React server, then automatically opens your browser at `http://localhost:5173`.

---

### Option 2: Manual CLI Startup

#### 1. Start the Backend (.NET 9 Web API)
```bash
cd backend
dotnet run --project src/TaskFlow.Api/TaskFlow.Api.csproj --launch-profile http
```
- **API Base URL**: `http://localhost:5000`
- **Swagger Documentation**: `http://localhost:5000/swagger`

#### 2. Start the Frontend (React.js)
```bash
cd frontend
npm install
npm run dev
```
- **Web App URL**: `http://localhost:5173`

---

## 🔑 Pre-Seeded Demo Credentials

The database automatically seeds realistic sprint data and credentials upon initial startup:

| Role | Email | Password |
|---|---|---|
| **Engineering Lead** (Default) | `demo@taskflow.dev` | `Demo@123` |
| **Senior Backend Engineer** | `sarah.chen@taskflow.dev` | `Demo@123` |
| **Lead Frontend Engineer** | `marcus.vance@taskflow.dev` | `Demo@123` |
| **Product Designer** | `elena.rostova@taskflow.dev` | `Demo@123` |

> 💡 *Tip for Interviews*: The login screen includes an **"Instant Demo Sign In"** button that logs in with one click as Alex Morgan with all 11 sprint tasks, metrics, and activities pre-loaded.

---

## 📡 REST API Catalog

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login and receive JWT bearer token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `GET` | `/api/auth/users` | List all team members | No |
| `GET` | `/api/projects` | List active projects with task counts | No |
| `POST` | `/api/projects` | Create a new project (auto-generates default board) | No |
| `GET` | `/api/boards/project/{id}/default` | Get default sprint board with columns & tasks | No |
| `GET` | `/api/tasks/project/{id}` | Search and filter tasks (priority, assignee, text) | No |
| `POST` | `/api/tasks` | Create task (auto-generates next key: TF-xxx) | No |
| `PUT` | `/api/tasks/{id}` | Update task details & story points | No |
| `PUT` | `/api/tasks/{id}/move` | Move task to new column/status | No |
| `DELETE` | `/api/tasks/{id}` | Delete task | No |
| `GET` | `/api/tasks/{id}/activities` | Get audit activity trail for a task | No |
| `GET` | `/api/analytics/project/{id}` | Get completion %, velocity, and priority breakdown | No |

---




