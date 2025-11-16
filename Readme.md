# 📚 ClassConnect: Learning Management System (LMS)

Hey there! I've been working on ClassConnect, a full-stack Learning Management System built with Go (backend) and React with TypeScript (frontend). This project combines robust server architecture with a modern, responsive UI to create a comprehensive educational platform. Let me walk you through what I've built so far! 😊

## 🌟 Overview

ClassConnect is designed to simplify the educational experience for both teachers and students. The platform manages courses, assignments, quizzes, materials, and user interactions in an intuitive interface.

## 🛠️ Tech Stack

### Backend
- **Go** with **Gin** framework for the API server
- **GORM** for database interactions with PostgreSQL
- **JWT** for authentication
- **Firebase** for cloud storage
- **Docker** for containerization

### Frontend
- **React** with **TypeScript**
- **Ant Design** components for UI
- **Redux Toolkit** for state management
- **Styled Components** for custom styling
- **React Router** for navigation
- **Framer Motion** for animations

## ✨ Features

### 🧑‍🏫 Course Management
- Create and manage courses with detailed information
- Organize courses by category and difficulty
- Support for multiple course roles (student, teacher, admin)
- Invitation system with unique codes

### 📝 Assignments & Submissions
- Create assignments with due dates, file requirements, and grading criteria
- Support for multiple file types in submissions
- Detailed submission tracking and management
- Grading system with feedback options

### 📊 Quizzes
- Interactive quiz creation with various question types
- Timed quizzes with custom settings
- Automatic and manual grading options
- Result analytics for instructors

### 📚 Learning Materials
- Upload and organize course materials
- Support for various file formats
- Link sharing capabilities

### 👨‍👩‍👧‍👦 User Management
- Role-based access control (student, teacher, admin)
- Profile management
- Enrollment tracking

### 📆 Dashboard & Announcements
- Personalized dashboards for users
- Upcoming assignments tracking
- Course announcements and notifications

## 🏗️ Architecture

I've structured the project with clean separation of concerns:

### Backend
- **Models**: Define database structures and relationships
- **Services**: Handle business logic
- **Handlers**: Process HTTP requests and responses
- **Routes**: Define API endpoints
- **Middlewares**: Implement cross-cutting concerns like authentication

### Frontend
- **Components**: Reusable UI elements organized by feature
- **Store**: Redux slices for state management
- **Hooks**: Custom React hooks for shared logic
- **API**: Services for backend communication
- **Utils**: Helper functions and utilities

## 📋 API Endpoints

The backend exposes RESTful endpoints for various resources:

- `/users/*`: User authentication and profile management
- `/courses/*`: Course CRUD operations
- `/assignments/*`: Assignment management
- `/submissions/*`: Submission handling
- `/materials/*`: Learning materials
- `/quizzes/*`: Quiz creation and participation
- `/grades/*`: Grading and feedback

## 🔒 Authentication & Security

I've implemented JWT-based authentication with secure token handling. The system includes:

- Registration and login flows
- Password hashing with bcrypt
- JWT token generation and validation
- Protected routes with authorization middleware

## 💾 Data Storage

- **PostgreSQL** for relational data
- **Firebase Storage** for file uploads (assignments, materials, etc.)

## 🎨 UI/UX Features

- Responsive design for desktop and mobile
- Dark/light theme support
- Interactive components with animations
- Drag-and-drop file uploads
- Rich text editing for assignments and materials
- Interactive calendar for scheduling

## 🚀 Getting Started

### Prerequisites
- Go 1.22+
- Node.js 20.17+
- PostgreSQL
- Firebase account (for storage)

### Backend Setup
1. Clone the repository
2. Set up environment variables (see `.env.example`)
3. Run `go mod download` to install dependencies
4. Run `go run main.go` to start the server

### Frontend Setup
1. Navigate to the `client` directory
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server

## 🔮 Future Improvements

I have several ideas for expanding ClassConnect:

- Real-time chat functionality for course discussions
- Video conferencing integration for virtual classrooms
- AI-assisted learning features
- Mobile app versions
- Advanced analytics for learning progress
- Improved accessibility features

## 🤝 Contributing

I'd love your contributions! Feel free to:
- Report bugs or suggest features by opening issues
- Submit pull requests with improvements
- Share ideas for new features

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

This is just the beginning of ClassConnect! I'm passionate about improving education through technology, and I hope this platform can make a difference in how people teach and learn. If you have any questions or suggestions, please don't hesitate to reach out! 🚀