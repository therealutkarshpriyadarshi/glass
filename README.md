# 🎓 Glass LMS - Learning Management System

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)
![React Version](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)
![Status](https://img.shields.io/badge/status-development-orange)

**A modern, full-stack Learning Management System built with Go and React**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Roadmap](#-roadmap) • [Contributing](#-contributing)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Known Issues](#-known-issues)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Glass LMS** is a modern, open-source Learning Management System designed to facilitate online education. Built with a robust Go backend and a sleek React frontend, Glass provides educators and students with essential tools for course management, assignments, quizzes, and collaboration.

### Why Glass?

- **🚀 Modern Stack**: Built with Go (Gin framework) and React (TypeScript)
- **🎨 Beautiful UI**: Clean, responsive design using shadcn/ui and Tailwind CSS
- **🔒 Secure**: JWT authentication, role-based access control, and security best practices
- **📱 Responsive**: Works seamlessly across desktop, tablet, and mobile devices
- **🔧 Extensible**: Modular architecture makes it easy to add new features

---

## ✨ Features

### Current Features ✅

#### Authentication & User Management
- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected routes with automatic token refresh
- ✅ Session management

#### Course Management
- ✅ Create, read, update, and delete courses
- ✅ Course details and metadata
- ✅ Course filtering and search
- ✅ Instructor and student views
- ✅ Course enrollment system

#### Assignment System
- ✅ Create and manage assignments
- ✅ Assignment metadata (due dates, points, descriptions)
- ✅ Publish/unpublish assignments
- ✅ Track upcoming and overdue assignments
- ✅ Assignment completion tracking
- ✅ Course-specific assignment views

#### File Management
- ✅ Firebase Cloud Storage integration
- ✅ File upload and download
- ✅ Material management backend
- ✅ Submission file handling

#### Grading System
- ✅ Grade creation and management
- ✅ Grade CRUD operations (backend)
- ✅ Performance tracking

#### Quiz System (Partial)
- ✅ Quiz creation with multiple question types
- ✅ Single correct and multiple correct questions
- ✅ Quiz metadata (time limits, passing scores)

### Planned Features 🚧

#### Phase 1: Foundation (In Progress)
- 🚧 Complete quiz retrieval functionality
- 🚧 Fix frontend data fetching
- 🚧 Wire up creation forms to backend APIs

#### Phase 2: Core LMS Features
- 📋 Assignment submission interface
- 📋 Grading and feedback interface
- 📋 Files browser and upload UI
- 📋 Announcements system
- 📋 Student gradebook view

#### Phase 3: Enhanced Features
- 📋 Quiz taking and results interface
- 📋 Calendar with deadline tracking
- 📋 User profile management
- 📋 Course analytics dashboard

#### Phase 4: Communication & Collaboration
- 📋 Real-time chat system
- 📋 Notification system
- 📋 Discussion forums
- 📋 Peer collaboration tools

#### Phase 5: Advanced Features
- 📋 Role-based access control (RBAC)
- 📋 Advanced search and filtering
- 📋 Course templates and cloning
- 📋 Mobile app (PWA)
- 📋 Third-party integrations (Google Classroom, Zoom)

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| **Go** | Backend language | 1.21+ |
| **Gin** | Web framework | Latest |
| **GORM** | ORM for database operations | v2 |
| **JWT-Go** | Authentication tokens | Latest |
| **PostgreSQL** | Primary database | 14+ |
| **Firebase** | Cloud storage | Latest |
| **bcrypt** | Password hashing | Latest |

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI library | 18.3.1 |
| **TypeScript** | Type-safe JavaScript | 5.5.3 |
| **Vite** | Build tool | 5.4.1 |
| **Redux Toolkit** | State management | 2.2.7 |
| **React Router** | Client-side routing | 6.26.1 |
| **Axios** | HTTP client | 1.7.7 |
| **shadcn/ui** | Component library | Latest |
| **Tailwind CSS** | Utility-first CSS | 4.1.17 |
| **Radix UI** | Accessible components | Latest |
| **Lucide React** | Icon library | 0.553.0 |
| **Framer Motion** | Animation library | 11.5.4 |

### Development & Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Docker**: Containerization
- **Git**: Version control

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Go** (1.21 or higher) - [Download](https://golang.org/dl/)
- **Node.js** (18.x or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **PostgreSQL** (14 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - Version control

### Optional
- **Docker** & **Docker Compose** - For containerized deployment
- **Firebase Account** - For cloud storage (free tier available)
- **Make** - For using Makefile commands

### System Requirements
- **OS**: Linux, macOS, or Windows (WSL recommended)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/therealutkarshpriyadarshi/glass.git
cd glass
```

### 2. Backend Setup

#### Step 1: Install Go Dependencies

```bash
cd server
go mod download
```

#### Step 2: Set Up Environment Variables

Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=glass_lms
DB_SSLMODE=disable

# JWT Configuration
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
TOKEN_EXPIRATION=24h

# Server Configuration
PORT=8080
GIN_MODE=debug

# Firebase Configuration (Optional)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=./firebase-credentials.json

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Step 3: Set Up Database

Create the PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE glass_lms;

# Exit psql
\q
```

The application will automatically run migrations on startup.

#### Step 4: Set Up Firebase (Optional)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Cloud Storage
4. Download service account credentials JSON
5. Place it in `server/firebase-credentials.json`

#### Step 5: Activate Server Routes

**IMPORTANT**: The server routes are currently commented out in `main.go`. Uncomment them:

```go
// In server/main.go, uncomment lines 16-39:

err := godotenv.Load()
if err != nil {
    log.Fatalf("Error loading .env file %v", err)
}
db := config.InitDB()
r := gin.Default()
secret := os.Getenv("SECRET_KEY")
expiration := 24 * time.Hour
cs, err := firebase.DefaultCloudStorage()
if err != nil {
    panic(err)
}
r.Use(cors.Default())
r.Use(gin.Logger())

routes.SetUpUserRoutes(r, db, []byte(secret), expiration)
routes.SetupCourseRoutes(r, db)
routes.SetupGradeRoutes(r, db)
routes.SetupAssignmentRoutes(r, db)
routes.SetupEnrollmentRoutes(r, db)
routes.SetupSubmissionRoutes(r, db, cs)
routes.SetupMaterialRoutes(r, db, cs)
routes.SetupQuizRoutes(r, db, secret)
_ = r.Run()
```

#### Step 6: Run the Backend

```bash
go run main.go
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

#### Step 1: Install Node Dependencies

```bash
cd ../client
npm install
```

#### Step 2: Set Up Environment Variables

Create a `.env` file in the `client` directory:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=10000

# App Configuration
VITE_APP_NAME=Glass LMS
```

#### Step 3: Fix Data Fetching (Temporary)

**IMPORTANT**: Remove the disabled data fetching flags:

1. In `src/components/dashboard/Dashboard.tsx` (line 20):
   ```typescript
   // Change from:
   const notLogin = false;
   if (notLogin) dispatch(fetchDashboardData());

   // To:
   const notLogin = true;
   if (notLogin) dispatch(fetchDashboardData());
   ```

2. In `src/components/courses/list/UserCourses.tsx` (line 21):
   ```typescript
   // Change from:
   const not = false;
   if (not) dispatch(fetchUserCourses());

   // To:
   const not = true;
   if (not) dispatch(fetchUserCourses());
   ```

#### Step 4: Run the Frontend

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Access the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Create a new account (Sign Up)
3. Login with your credentials
4. Start exploring Glass LMS!

---

## 📁 Project Structure

```
glass/
├── client/                      # React frontend
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── api/                 # API client and utilities
│   │   │   ├── server.ts        # Axios instance with auth
│   │   │   └── fileupload.ts    # File upload utilities
│   │   ├── components/          # React components (feature-based)
│   │   │   ├── auth/            # Authentication components
│   │   │   ├── courses/         # Course management
│   │   │   ├── dashboard/       # Dashboard components
│   │   │   ├── error/           # Error boundary & 404
│   │   │   ├── student/         # Student-specific views
│   │   │   └── ui/              # shadcn/ui components
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── auth.ts          # Authentication hook
│   │   │   └── quiz.ts          # Quiz form management
│   │   ├── store/               # Redux state management
│   │   │   ├── store.ts         # Redux store configuration
│   │   │   ├── hooks.ts         # Typed Redux hooks
│   │   │   ├── auth/            # Auth state slice
│   │   │   ├── assignments/     # Assignment state
│   │   │   ├── courses/         # Course state
│   │   │   ├── dashboard/       # Dashboard state
│   │   │   ├── materials/       # Materials state
│   │   │   ├── people/          # Students & mentors
│   │   │   └── quiz/            # Quiz state
│   │   ├── lib/                 # Utility libraries
│   │   ├── utils/               # Helper functions
│   │   ├── main.tsx             # React entry point
│   │   ├── router.tsx           # Route definitions
│   │   ├── Layout.tsx           # Main layout wrapper
│   │   └── index.css            # Global styles
│   ├── .env                     # Environment variables
│   ├── .env.example             # Environment template
│   ├── vite.config.ts           # Vite configuration
│   ├── tailwind.config.js       # Tailwind CSS config
│   ├── tsconfig.json            # TypeScript config
│   ├── components.json          # shadcn/ui config
│   └── package.json             # Frontend dependencies
│
├── server/                      # Go backend
│   ├── app/
│   │   ├── handlers/            # HTTP request handlers
│   │   │   ├── user.go          # User authentication
│   │   │   ├── course.go        # Course management
│   │   │   ├── assignment.go    # Assignment operations
│   │   │   ├── material.go      # Materials handling
│   │   │   ├── quiz.go          # Quiz management
│   │   │   ├── grade.go         # Grading system
│   │   │   ├── enrollment.go    # Enrollment operations
│   │   │   ├── submission.go    # Submission handling
│   │   │   ├── utils.go         # Helper functions
│   │   │   └── constants.go     # Constants
│   │   ├── models/              # Database models (GORM)
│   │   │   ├── user.go          # User model
│   │   │   ├── course.go        # Course model
│   │   │   ├── assignment.go    # Assignment model
│   │   │   ├── meterial.go      # Material model
│   │   │   ├── quiz.go          # Quiz & Question models
│   │   │   ├── grade.go         # Grade model
│   │   │   ├── enrollment.go    # Enrollment model
│   │   │   ├── submission.go    # Submission model
│   │   │   ├── file.go          # File model
│   │   │   └── tablenames.go    # Table name constants
│   │   ├── services/            # Business logic layer
│   │   │   └── (service files)
│   │   └── middleware/          # Middleware functions
│   │       └── (middleware files)
│   ├── config/                  # Configuration
│   │   └── database.go          # Database setup
│   ├── tests/                   # Test files
│   │   └── setup/               # Test setup utilities
│   ├── .env                     # Environment variables
│   ├── .env.example             # Environment template
│   ├── main.go                  # Application entry point
│   ├── go.mod                   # Go dependencies
│   └── go.sum                   # Dependency checksums
│
├── .gitignore                   # Git ignore rules
├── README.md                    # This file
└── LICENSE                      # Project license
```

---

## 💻 Development

### Frontend Development

#### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Type check
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

#### Adding New Components

1. **Create component file**:
   ```bash
   cd client/src/components/feature-name
   touch ComponentName.tsx
   ```

2. **Use shadcn/ui components**:
   ```bash
   npx shadcn-ui@latest add button
   npx shadcn-ui@latest add dialog
   ```

3. **Create Redux slice** (if needed):
   ```bash
   mkdir client/src/store/feature-name
   touch client/src/store/feature-name/slice.ts
   touch client/src/store/feature-name/api.ts
   touch client/src/store/feature-name/types.d.ts
   ```

#### Code Style Guidelines

- Use **TypeScript** for all new files
- Follow **feature-based organization**
- Use **functional components** with hooks
- Implement **error boundaries** for new routes
- Add **loading states** for async operations
- Use **shadcn/ui** components for consistency
- Follow **Tailwind CSS** utility patterns

### Backend Development

#### Available Commands

```bash
# Run server
go run main.go

# Run tests
go test ./...

# Format code
go fmt ./...

# Check for errors
go vet ./...

# Install dependencies
go mod tidy

# Build binary
go build -o bin/server main.go
```

#### Adding New Features

1. **Create model** in `app/models/`:
   ```go
   type NewModel struct {
       gorm.Model
       // fields...
   }
   ```

2. **Create service** in `app/services/`:
   ```go
   type NewService struct {
       db *gorm.DB
   }
   ```

3. **Create handler** in `app/handlers/`:
   ```go
   type NewHandler struct {
       serv *services.NewService
   }
   ```

4. **Register routes** in route setup

#### Code Style Guidelines

- Use **handler → service → model** architecture
- Implement proper **error handling**
- Add **validation** for all inputs
- Use **dependency injection**
- Write **unit tests** for services
- Follow **Go conventions** (gofmt, golint)
- Add **documentation comments**

### Database Migrations

GORM AutoMigrate runs on startup. For manual migrations:

```go
// In config/database.go or main.go
db.AutoMigrate(
    &models.User{},
    &models.Course{},
    &models.Assignment{},
    // Add new models here
)
```

### Environment Variables

#### Backend (.env)
```env
# Core
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=glass_lms
SECRET_KEY=your-secret-key
PORT=8080

# Firebase (optional)
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=10000
VITE_APP_NAME=Glass LMS
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints Overview

#### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login user | ❌ |
| GET | `/auth/me` | Get current user | ✅ |

#### Courses
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/courses` | Create course | ✅ |
| GET | `/courses` | Get all courses | ✅ |
| GET | `/courses/:id` | Get course by ID | ✅ |
| PUT | `/courses/:id` | Update course | ✅ |
| DELETE | `/courses/:id` | Delete course | ✅ |

#### Assignments
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/assignments` | Create assignment | ✅ |
| GET | `/assignments/:id` | Get assignment | ✅ |
| PUT | `/assignments/:id` | Update assignment | ✅ |
| DELETE | `/assignments/:id` | Delete assignment | ✅ |
| GET | `/courses/:courseId/assignments` | Get course assignments | ✅ |
| POST | `/assignments/:id/publish` | Publish assignment | ✅ |
| POST | `/assignments/:id/unpublish` | Unpublish assignment | ✅ |
| GET | `/assignments/upcoming` | Get upcoming assignments | ✅ |
| GET | `/assignments/overdue` | Get overdue assignments | ✅ |

#### Submissions
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/submissions` | Submit assignment | ✅ |
| GET | `/submissions/:id` | Get submission | ✅ |
| PUT | `/submissions/:id` | Update submission | ✅ |
| DELETE | `/submissions/:id` | Delete submission | ✅ |

#### Grades
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/grades` | Create grade | ✅ |
| GET | `/grades/:id` | Get grade | ✅ |
| PUT | `/grades/:id` | Update grade | ✅ |
| DELETE | `/grades/:id` | Delete grade | ✅ |

#### Materials
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/materials` | Upload material | ✅ |
| GET | `/materials/:id` | Get material | ✅ |
| PUT | `/materials/:id` | Update material | ✅ |
| DELETE | `/materials/:id` | Delete material | ✅ |

#### Quizzes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/quizzes` | Create quiz | ✅ |
| GET | `/quizzes/:id` | Get quiz | ✅ |

#### Enrollments
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/enrollments` | Enroll in course | ✅ |
| GET | `/enrollments` | Get enrollments | ✅ |
| DELETE | `/enrollments/:id` | Unenroll from course | ✅ |

### Example Request

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "securepassword"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword"
  }'

# Get courses (with auth)
curl -X GET http://localhost:8080/api/courses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🚢 Deployment

### Docker Deployment (Recommended)

#### Step 1: Create docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: glass_lms
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./server
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: your_password
      DB_NAME: glass_lms
      SECRET_KEY: your-production-secret-key
      PORT: 8080
    ports:
      - "8080:8080"
    depends_on:
      - postgres

  frontend:
    build: ./client
    environment:
      VITE_API_BASE_URL: http://localhost:8080/api
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

#### Step 2: Create Dockerfiles

**Backend Dockerfile** (`server/Dockerfile`):
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
```

**Frontend Dockerfile** (`client/Dockerfile`):
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Step 3: Deploy

```bash
docker-compose up -d
```

### Manual Deployment

#### Backend

```bash
cd server
go build -o glass-server main.go
./glass-server
```

#### Frontend

```bash
cd client
npm run build
# Serve dist/ folder with nginx or any static server
```

### Production Checklist

- [ ] Set strong `SECRET_KEY` in production
- [ ] Use PostgreSQL (not SQLite)
- [ ] Enable SSL/TLS
- [ ] Set up proper CORS origins
- [ ] Configure Firebase production credentials
- [ ] Set up error monitoring (Sentry)
- [ ] Enable rate limiting
- [ ] Set up backup strategy
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Set up CI/CD pipeline
- [ ] Enable logging and monitoring

---

## ⚠️ Known Issues

### Critical Issues 🔴

1. **Server Routes Commented Out**
   - **File**: `server/main.go` (lines 16-39)
   - **Impact**: Backend is not accessible
   - **Fix**: Uncomment route setup code
   - **Status**: Documented in Quick Start

2. **Dashboard Data Fetch Disabled**
   - **File**: `client/src/components/dashboard/Dashboard.tsx:20`
   - **Impact**: Dashboard always shows empty state
   - **Fix**: Change `const notLogin = false;` to `true`
   - **Status**: Documented in Quick Start

3. **Courses List Never Loads**
   - **File**: `client/src/components/courses/list/UserCourses.tsx:21`
   - **Impact**: Course list always empty
   - **Fix**: Change `const not = false;` to `true`
   - **Status**: Documented in Quick Start

4. **GetQuiz Handler Incomplete**
   - **File**: `server/app/handlers/quiz.go:43-52`
   - **Impact**: Cannot retrieve quizzes
   - **Fix**: Implement quiz retrieval logic
   - **Status**: Planned for Phase 1

### Feature Gaps 🟡

1. **Empty Course Tabs**
   - Files tab (Tab 2)
   - Chat tab (Tab 4)
   - Calendar tab (Tab 5)
   - Submissions tab (Tab 6)

2. **Missing UI Implementations**
   - Assignment submission form
   - Grading interface
   - Quiz taking interface
   - User profile page

3. **Backend Without Frontend**
   - Enrollment management
   - Grade viewing
   - Material browsing

### Minor Issues 🟢

- No test coverage
- Missing API documentation (Swagger)
- No real-time features
- Limited error messages

For a complete list, see [Issues](https://github.com/therealutkarshpriyadarshi/glass/issues)

---

## 🗺️ Roadmap

### Q1 2024: Foundation ✅
- [x] Project setup and architecture
- [x] User authentication system
- [x] Basic course management
- [x] Assignment CRUD operations
- [x] Database models and migrations
- [x] Protected routes and security

### Q2 2024: Core Features 🚧
- [ ] Fix critical bugs and data fetching
- [ ] Complete assignment submission system
- [ ] Implement grading interface
- [ ] Add file management UI
- [ ] Build announcements system
- [ ] Complete quiz functionality

### Q3 2024: Enhanced Features 📋
- [ ] Quiz taking and results
- [ ] Calendar and deadline tracking
- [ ] User profiles and settings
- [ ] Course analytics
- [ ] Notification system
- [ ] Mobile responsiveness improvements

### Q4 2024: Advanced Features 📋
- [ ] Real-time chat system
- [ ] Discussion forums
- [ ] Advanced search
- [ ] Role-based access control
- [ ] Course templates
- [ ] Mobile app (PWA)

### 2025: Scale & Polish 📋
- [ ] Performance optimization
- [ ] Comprehensive testing (80%+ coverage)
- [ ] API documentation (Swagger)
- [ ] Internationalization (i18n)
- [ ] Third-party integrations
- [ ] Enterprise features

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 **Report bugs** - Open an issue with detailed reproduction steps
- ✨ **Suggest features** - Share your ideas in discussions
- 📝 **Improve documentation** - Fix typos, add examples, clarify instructions
- 💻 **Submit code** - Fix bugs, implement features, improve performance
- 🎨 **Design improvements** - Enhance UI/UX
- 🧪 **Write tests** - Increase test coverage

### Development Workflow

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   git clone https://github.com/YOUR_USERNAME/glass.git
   cd glass
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b fix/bug-description
   ```

3. **Make your changes**
   - Follow code style guidelines
   - Add tests if applicable
   - Update documentation

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add amazing feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

### Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add quiz submission functionality
fix: resolve dashboard data fetching issue
docs: update installation instructions
style: format code with prettier
refactor: restructure course service
test: add unit tests for assignment handler
chore: update dependencies
```

### Code Review Process

1. All PRs require at least one review
2. CI/CD checks must pass
3. Code coverage should not decrease
4. Follow existing code patterns
5. Update relevant documentation

### Getting Help

- 💬 **Discussions**: Ask questions, share ideas
- 🐛 **Issues**: Report bugs, request features
- 📧 **Email**: [your-email@example.com]

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Glass LMS Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **[Gin](https://gin-gonic.com/)** - Fast Go web framework
- **[React](https://react.dev/)** - UI library
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful component library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[GORM](https://gorm.io/)** - Go ORM library
- **[Redux Toolkit](https://redux-toolkit.js.org/)** - State management
- **[Vite](https://vitejs.dev/)** - Next-generation build tool
- All our amazing [contributors](https://github.com/therealutkarshpriyadarshi/glass/graphs/contributors)

---

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/therealutkarshpriyadarshi/glass/issues)
- **Discussions**: [Ask questions and share ideas](https://github.com/therealutkarshpriyadarshi/glass/discussions)
- **Email**: your-email@example.com
- **Twitter**: [@yourusername](https://twitter.com/yourusername)

---

## 📊 Project Stats

![GitHub Stars](https://img.shields.io/github/stars/therealutkarshpriyadarshi/glass?style=social)
![GitHub Forks](https://img.shields.io/github/forks/therealutkarshpriyadarshi/glass?style=social)
![GitHub Issues](https://img.shields.io/github/issues/therealutkarshpriyadarshi/glass)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/therealutkarshpriyadarshi/glass)
![GitHub Contributors](https://img.shields.io/github/contributors/therealutkarshpriyadarshi/glass)

---

<div align="center">

**Built with ❤️ by the Glass LMS Team**

[⬆ Back to Top](#-glass-lms---learning-management-system)

</div>
