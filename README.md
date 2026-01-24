# Digital Handyman Platform

Development-only full-stack boilerplate.

Backend: Node.js + Express (MySQL via mysql2, JWT auth)
Frontend: React + Vite, React Router, Axios

Quick start

1. Create a `.env` file in `/digital-handyman-platform/backend` with:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=digital_handyman
JWT_SECRET=your_jwt_secret
ADMIN_USER=admin
ADMIN_PASS=adminpassword
```

2. Install and run backend:

```bash
cd backend
npm install
npm run start
```

3. Install and run frontend:

```bash
cd frontend
npm install
npm run dev
```

Notes: development only. Backend exposes REST APIs on `http://localhost:5000`.
