# Mini Lead Management System

A simple, clean, and interview-friendly Lead Management System built using FastAPI (Python) and React (Vite) with Bootstrap.

---

## 🛠️ Tech Stack

### Backend
- **Python 3.13**
- **FastAPI**: Lightweight, modern REST framework.
- **SQLAlchemy 2.0**: Object-relational mapping.
- **Alembic**: Database migrations.
- **MySQL**: Relational database.
- **JWT (python-jose)**: Secure token-based authentication.
- **Bcrypt (passlib)**: Secure password hashing.

### Frontend
- **React 19**
- **Vite**: Ultra-fast build tool.
- **React Router**: Single Page App routing.
- **Axios**: HTTP request client with auto-injecting auth interceptors.
- **Bootstrap 5 & Bootstrap Icons**: Clean, responsive styling.
- **React Context API**: Global authentication state.

---

## 🏗️ Architecture Overview

The system uses a simple, separation-of-concerns CRUD structure designed to be clean and easy to explain in interviews:

```
├── backend/
│   ├── alembic/              # DB Migrations
│   └── app/
│       ├── api/v1/           # API endpoints (Auth, Users, Leads, Dashboard)
│       ├── core/             # Configuration, Database Connection, Auth & Role dependencies
│       ├── models/           # SQLAlchemy Declarative Models
│       ├── schemas/          # Pydantic schemas (V2 validation)
│       ├── services/         # Business logic (Round Robin assignment, Activity Logging, External API)
│       ├── tests/            # Pytest integration tests
│       └── main.py           # App startup & middleware registration
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI elements (Navbar, Sidebar)
    │   ├── context/          # Auth Context & State
    │   ├── layouts/          # Responsive App shell
    │   ├── pages/            # Page Views (Login, Dashboard, Lead details & list, User management)
    │   ├── routes/           # Routing and role authorization barriers
    │   └── services/         # Axios API clients
```

---

## 📊 Database ER Diagram

```mermaid
erDiagram
    users {
        int id PK
        string name
        string email
        string password
        string role
        datetime created_at
        datetime updated_at
    }
    leads {
        int id PK
        string name
        string email
        string phone
        string source
        string status
        text notes
        int assigned_to FK
        int created_by FK
        datetime created_at
        datetime updated_at
    }
    activity_logs {
        int id PK
        int lead_id FK
        int user_id FK
        string action
        string description
        datetime created_at
    }
    users ||--o{ leads : "creates (created_by)"
    users ||--o{ leads : "assigned (assigned_to)"
    leads ||--o{ activity_logs : "has_logs"
    users ||--o{ activity_logs : "logs"
```

---

## ⚙️ Setup and Running Instructions

### 1. Database Setup
Ensure you have MySQL running and create a database named `lead_management_system`.
Update the database connection details in `backend/.env` if necessary:
```env
DATABASE_URL=mysql+pymysql://kd2-sahil-92400:manager@localhost:3306/lead_management_system
SECRET_KEY=THIS_IS_MY_SUPER_SECRET_KEY_123456789
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### 2. Backend Installation & Run
From the `backend` folder:
1. Activate virtual environment:
   ```bash
   .\venv\Scripts\activate
   ```
2. Run database migrations:
   ```bash
   alembic upgrade head
   ```
3. Start the dev server:
   ```bash
   uvicorn app.main:app --reload
   ```
4. API docs are available at: `http://localhost:8000/docs`

### 3. Frontend Installation & Run
From the `frontend` folder:
1. Install node dependencies:
   ```bash
   npm install
   ```
2. Start the Vite server:
   ```bash
   npm run dev
   ```
3. Open browser to: `http://localhost:5173`

---

## 🧪 Running Automated Tests
From the `backend` folder:
```bash
.\venv\Scripts\python -m pytest
```

---

## 🔐 Role Capabilities Matrix

| Feature | Admin | Manager | Agent |
|---|---|---|---|
| Register Account | Yes | Yes | Yes |
| View Users List | Yes | No | No |
| Create/Edit Users | Yes | No | No |
| Create Leads | Yes | Yes | No |
| Import Lead (Random User API) | Yes | Yes | No |
| Edit/Reassign All Leads | Yes | Yes | No |
| View Assigned Leads | Yes (All) | Yes (All) | Yes (Own Only) |
| Update Status/Notes | Yes | Yes | Yes (Own Only) |
| Delete Leads | Yes | Yes | No |
