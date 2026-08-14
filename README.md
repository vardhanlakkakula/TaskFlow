# TaskFlow

TaskFlow is a full-stack MERN task management application designed to help users organize, manage, and track their daily tasks through a simple productivity workspace.

## 🚀 Live Demo

👉 [TaskFlow Live](https://task-flow-iota-drab.vercel.app)

## ✨ Features

- User registration and login
- Google OAuth authentication
- JWT-based authentication
- Protected dashboard
- Create, update, complete, and delete tasks
- Task priority management
- Deadline and reminder management
- Email task reminders
- Search and task filtering
- Dashboard task statistics
- MongoDB database integration
- REST API backend
- Responsive user interface

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Node-Cron
- Nodemailer

### Authentication

- JWT Authentication
- Google OAuth
- bcryptjs password hashing

## 🏗️ Project Structure

```text
TaskFlow/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   ├── vercel.json
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md