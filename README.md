# TaskFlow

TaskFlow is a full-stack MERN task management application designed to help users organize, manage, and track their daily tasks from a simple productivity workspace.

## 🚀 Features

- User registration and login
- Google OAuth authentication
- Secure JWT-based authentication
- Protected dashboard
- Create, update, complete, and delete tasks
- Task status management
- Task reminders through email
- Forgot password functionality
- Secure password reset through email
- Responsive authentication interface
- MongoDB database integration
- REST API backend

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
- bcrypt
- Nodemailer

### Authentication & Email

- Google OAuth
- Brevo SMTP
- JWT authentication
- Password reset through email

## 📁 Project Structure

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
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md