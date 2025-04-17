# CodeCollab AI

An AI-powered collaborative coding platform that enables real-time team development with intelligent assistance. Built with React and Node.js, this platform combines the power of Google AI with real-time collaboration features to enhance team productivity. Teams can develop, test, and run web applications directly in the browser using WebContainers technology.

## Project Overview

genAlpha-i is a modern development environment that allows teams to:
- Collaborate in real-time on code projects
- Get AI-powered code suggestions and completions
- edit code simultaneously
- Communicate through integrated chat
- Get instant feedback and debugging assistance from AI
- Run complete web applications in the browser using WebContainers

## Project Structure

```
.
├── frontend/          # React frontend application with real-time code editor and WebContainer integration
├── backend/           # Node.js backend server with AI integration
└── README.md
```

## Prerequisites

- Node.js
- MongoDB
- Redis
- npm or yarn
- Google AI API access
- Modern web browser (Chrome, Firefox, or Edge recommended)

## Environment Variables Setup

### Backend (.env)

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agent
JWT_SECRET=your_jwt_secret
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
GOOGLE_API_KEY=your_google_api_key
```

### Frontend (.env)

Create a `.env` file in the `frontend` directory with the following variables:

```env
VITE_API_URL=http://localhost:5000
```

## Installation

1. Clone the repository:

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Technologies Used

### Frontend
- React - UI framework
- Vite - Build tool
- TailwindCSS - Styling
- Socket.io Client - Real-time communication
- Axios - API requests
- React Router DOM - Navigation
- Highlight.js - Syntax highlighting
- WebContainer API - Browser-based development environment
- @webcontainer/api - WebContainer integration

### Backend
- Node.js - Runtime environment
- Express - Web framework
- MongoDB - Database
- Redis - Caching and real-time data
- Socket.io - WebSocket communication
- Google AI - Code generation and assistance
- JWT Authentication - Secure user sessions

## Key Features
- Real-time collaborative code editing
- AI-powered code suggestions and completions
- Live code sharing and pair programming
- Integrated team chat
- Syntax highlighting and code formatting
- Real-time debugging assistance
- Browser-based development environment with WebContainers
- Real-time preview of web applications
- Integrated terminal access
- Package management in the browser itself

## Site glimse
https://drive.google.com/file/d/1HkDQZIAgJ1lhsPN06NYjs59QYqqduAO0/view?usp=drive_link


