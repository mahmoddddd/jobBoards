---
description: How to run the JobBoard project (backend + frontend)
---

## Prerequisites
- Node.js 18+ installed
- MongoDB running (local or Atlas connection string in `.env`)

## Steps

### 1. Install backend dependencies
// turbo
```bash
cd e:\apps\jopBoard\backend && npm install
```

### 2. Install frontend dependencies
// turbo
```bash
cd e:\apps\jopBoard\frontend && npm install
```

### 3. Start the backend server
```bash
cd e:\apps\jopBoard\backend && npm run dev
```
This starts the Express + Socket.io server on **port 5000**.

### 4. Start the frontend dev server
```bash
cd e:\apps\jopBoard\frontend && npm run dev
```
This starts the Next.js dev server on **port 3000**.

### 5. (Optional) Seed the database
```bash
cd e:\apps\jopBoard\backend && node seed.js
```
This populates the database with sample data. All passwords are `password123`.

## Quick Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health
