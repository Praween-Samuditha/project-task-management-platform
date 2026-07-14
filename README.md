# 🚀 Project and Team Task Management Platform

A full-stack **Project and Team Task Management Platform** developed using **Next.js**, **Node.js**, **Express.js**, **Prisma ORM**, and **MySQL**. The platform provides secure authentication, role-based access control, project and task management, dashboard analytics, and a responsive user interface. It also includes a GitHub Actions CI workflow for automated build validation.

**GitHub Repository:**  
https://github.com/Praween-Samuditha/project-task-management-platform.git

---

# 📋 Project Overview

This application enables organizations and teams to efficiently manage projects, assign tasks, monitor progress, and collaborate through a centralized system. Different user roles are granted different permissions to ensure secure and controlled access to system resources.

---

# ✨ Core Features

## 👨‍💼 Administrator

- Manage users
- Assign and update user roles
- Create, edit, and delete projects
- Manage project members
- Manage all tasks
- View system-wide dashboard statistics
- Control overall system access

---

## 📁 Project Manager

- Create and manage projects
- Assign team members to projects
- Create, edit, and delete project tasks
- Assign tasks to project members
- Track project progress
- View dashboard statistics

---

## 👨‍💻 Team Member

- View assigned projects
- View assigned tasks
- Update task progress
- Change task status (where permitted)
- Participate in project workflow

---

# 🔐 Authentication & Security

- JWT Authentication
- Secure password hashing
- Role-Based Access Control (RBAC)
- Protected API routes
- Input validation using Zod
- Prisma ORM for secure database access

---

# 📊 Dashboard

Role-based dashboard providing:

- Total Users
- Total Projects
- Active Projects
- Total Tasks
- Todo Tasks
- In Progress Tasks
- Completed Tasks

---

# 🛠 Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios
- React Hook Form
- Zod

## Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- JWT
- Bcrypt
- Zod Validation

## Database

- MySQL

## DevOps

- Git
- GitHub
- GitHub Actions (CI)

---

# 📁 Project Structure

```text
project-task-management-platform
│
├── backend
│   ├── prisma
│   ├── src
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── routes
│   │   ├── services
│   │   ├── validators
│   │   └── utils
│   └── package.json
│
├── frontend
│   ├── src
│   │   ├── app
│   │   ├── components
│   │   ├── contexts
│   │   ├── services
│   │   ├── hooks
│   │   ├── lib
│   │   └── types
│   └── package.json
│
└── .github
    └── workflows
```

---

# 🚀 Getting Started

## Prerequisites

- Node.js 20+
- MySQL
- Git
- npm

---

## Clone the Repository

```bash
git clone https://github.com/Praween-Samuditha/project-task-management-platform.git

cd project-task-management-platform
```

---

# Backend Setup

```bash
cd backend
```

Install dependencies

```bash
npm install
```

Create a `.env` file from `.env.example`

```bash
cp .env.example .env
```

Generate Prisma Client

```bash
npx prisma generate
```

Run database migrations

```bash
npx prisma migrate dev
```

(Optional) Seed initial roles

```bash
npx ts-node seedRoles.ts
```

Start the backend server

```bash
npm run dev
```

Backend runs at:

```
http://localhost:5000
```

---

# Frontend Setup

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Create a `.env.local` file from `.env.example`

```bash
cp .env.example .env.local
```

Run the frontend

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

# 🔧 Environment Variables

## Backend

```env
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
```

## Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

# 📡 REST API Modules

- Authentication
- Users
- Projects
- Project Members
- Tasks
- Dashboard

---

# 📱 Responsive Design

The application is fully responsive and optimized for:

- Desktop
- Tablet
- Mobile

---

# 🔄 CI/CD Pipeline

The project includes a **GitHub Actions** Continuous Integration workflow.

The workflow automatically:

- Installs project dependencies
- Generates Prisma Client
- Runs lint checks
- Builds the backend
- Builds the frontend

Workflow file:

```text
.github/workflows/ci.yml
```

---

# 📂 Documentation

The repository includes or is intended to include:

- README
- `.env.example`
- API Documentation / Postman Collection
- Entity Relationship Diagram (ERD)
- Use Case Diagram
- System Architecture Diagram
- Feature Completion Report
- CI/CD Workflow

---

# 🤖 AI Assistance

The following AI tools were used during development:

- **ChatGPT (OpenAI)**
  - Architecture guidance
  - Code review
  - Debugging assistance
  - Documentation support
  - Development planning

- **Amazon Q / Antigravity**
  - Frontend UI generation
  - Refactoring assistance
  - Build troubleshooting
  - CI workflow improvements

All AI-generated code was reviewed, tested, modified, and integrated before being included in the final project.

---

# 👨‍💻 Author

**Praween Samuditha**


---

# 📄 License

This project was developed as part of a technical assessment and is intended for educational and evaluation purposes.
