# ClassConnect LMS - Development Roadmap

## Executive Summary

ClassConnect LMS is a Learning Management System built with:
- **Backend:** Go (Gin framework) + PostgreSQL + GORM
- **Frontend:** React + TypeScript + Redux Toolkit + Tailwind CSS
- **Storage:** Firebase Cloud Storage
- **Infrastructure:** Docker + Docker Compose

**Current Status:**
- ✅ Backend API: ~70% complete (core CRUD exists, security gaps)
- ⚠️ Frontend: ~30% complete (UI exists, minimal API integration)
- 🔴 **Critical Issues:** Multiple blocking bugs preventing core workflows

---

## Critical Issues Blocking All Workflows

### 🔴 CRITICAL - Must Fix Immediately

#### 1. Submission Route Not Registered
**Impact:** Students cannot submit assignments at all.

**Problem:**
- Handler exists: `server/app/handlers/submission.go:CreateSubmission`
- Service exists: `server/app/services/submission.go:CreateSubmission`
- Route missing: `server/app/routes/submission.go` has no POST route

**Fix:**
```go
// Add to server/app/routes/submission.go
submissionRouter.POST("/assignment/:assignmentId", handler.CreateSubmission)
```

**Estimate:** 5 minutes

---

#### 2. Hardcoded JWT Secret in Enrollment Routes
**Impact:** Security vulnerability - enrollment authentication broken.

**Problem:**
- File: `server/app/routes/enrollment.go:11`
- Uses hardcoded "hello" instead of actual JWT secret
- All enrollment routes use wrong secret

**Fix:**
```go
// Change from:
enrollmentRoutes.Use(middlewares.AuthMiddleware("hello"))
// To:
enrollmentRoutes.Use(middlewares.AuthMiddleware(secret))
```

**Estimate:** 5 minutes

---

#### 3. Auth Token Not Initialized on App Load
**Impact:** All authenticated requests fail with 401 after page refresh.

**Problem:**
- Token stored in localStorage but never set on axios instance
- File: `client/src/main.tsx` or `client/src/App.tsx`

**Fix:**
```typescript
// Add to App.tsx or main.tsx
import { setAuthToken } from './api/server';

useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    setAuthToken(token);
  }
}, []);
```

**Estimate:** 10 minutes

---

#### 4. No Authorization Middleware on Most Routes
**Impact:** Anyone can create/update/delete courses, assignments, materials.

**Problem:**
- Only user and quiz routes have auth middleware
- Courses, assignments, materials, grades all public

**Fix:** Add `middlewares.AuthMiddleware(secret)` to:
- Course routes
- Assignment routes
- Material routes
- Grade routes
- Submission routes (if not already)

**Estimate:** 30 minutes

---

#### 5. Database Migrations Incomplete
**Impact:** Database tables not created, app crashes on startup.

**Problem:**
- File: `server/app/config/db.go:22`
- Only Course model migrates
- All other models ignored

**Fix:**
```go
DB.AutoMigrate(
    &models.User{},
    &models.Course{},
    &models.Assignment{},
    &models.Enrollment{},
    &models.Submission{},
    &models.Grade{},
    &models.Quiz{},
    &models.Question{},
    &models.Option{},
    &models.QuizSubmission{},
    &models.Answer{},
    &models.Material{},
    &models.MaterialFile{},
    &models.SubmissionFile{},
    &models.AssignmentFile{},
)
```

**Estimate:** 15 minutes

---

## Phase 0: Critical Bug Fixes (Day 1)
**Goal:** Fix blocking issues to enable basic workflows

### Tasks

| Priority | Task | File | Estimate |
|----------|------|------|----------|
| P0 | Add submission POST route | `server/app/routes/submission.go` | 5 min |
| P0 | Fix enrollment JWT secret | `server/app/routes/enrollment.go` | 5 min |
| P0 | Add all models to migration | `server/app/config/db.go` | 15 min |
| P0 | Initialize auth token on app load | `client/src/App.tsx` | 10 min |
| P0 | Add auth middleware to courses | `server/app/routes/course.go` | 10 min |
| P0 | Add auth middleware to assignments | `server/app/routes/assignment.go` | 10 min |
| P0 | Add auth middleware to materials | `server/app/routes/material.go` | 10 min |
| P0 | Add auth middleware to grades | `server/app/routes/grade.go` | 10 min |

**Total Estimate:** 1-2 hours

### Testing Checklist
- [ ] Run `docker-compose up` - all models migrate
- [ ] Login - token persists after refresh
- [ ] Create course - requires authentication
- [ ] Create assignment - requires authentication
- [ ] Student can submit assignment (route exists)

---

## Phase 1: Core Backend Infrastructure (Days 2-3)
**Goal:** Complete backend API with proper authorization

### 1.1 Add Missing Endpoints

#### User Endpoints
**File:** `server/app/routes/user.go`

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/users/courses` | GET | Get user's enrolled courses | ❌ Missing |
| `/users/created-courses` | GET | Get courses user created | ❌ Missing |

**Implementation:**
```go
// Add to handlers/user.go
func (h *UserHandler) GetEnrolledCourses(c *gin.Context) {
    userID := c.GetUint("userID")
    courses, err := h.service.GetEnrolledCourses(userID)
    // ... return courses
}

// Add to services/user.go
func (s *UserService) GetEnrolledCourses(userID uint) ([]models.Course, error) {
    var courses []models.Course
    err := s.db.Joins("JOIN enrollments ON enrollments.course_id = courses.id").
        Where("enrollments.user_id = ? AND enrollments.status = ?", userID, "approved").
        Find(&courses).Error
    return courses, err
}
```

**Estimate:** 1 hour

---

#### Course Endpoints
**File:** `server/app/routes/course.go`

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/courses/:id/invitation-code` | POST | Generate invitation code | ❌ Missing |
| `/courses/:id/students` | GET | Get enrolled students | ❌ Missing |

**Implementation:**
- Add invitation code generation (8-char alphanumeric)
- Ensure unique code generation with retry logic

**Estimate:** 1.5 hours

---

#### Material Endpoints
**File:** `server/app/routes/material.go`

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/materials/course/:courseId` | GET | List materials for course | ❌ Missing |

**Estimate:** 30 minutes

---

### 1.2 Add Authorization Middleware

#### Permission Checks Needed

**Course Ownership:**
```go
// middleware/ownership.go
func CourseOwnershipMiddleware(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        userID := c.GetUint("userID")
        courseID := c.Param("id")

        var enrollment models.Enrollment
        err := db.Where("user_id = ? AND course_id = ? AND role IN ?",
            userID, courseID, []string{"teacher", "admin"}).First(&enrollment).Error

        if err != nil {
            c.JSON(403, gin.H{"error": "Not authorized"})
            c.Abort()
            return
        }
        c.Next()
    }
}
```

**Apply to:**
- Update course
- Delete course
- Create assignment
- Update assignment
- Delete assignment
- Grade submissions

**Estimate:** 2 hours

---

### 1.3 Add Role-Based Access Control

**Enrollment-Based Permissions:**
- Students: View published content, submit assignments
- Teachers: Full course management, grading
- Admins: Everything

**Files to modify:**
- `server/app/middlewares/authorization.go` (create)
- Apply to all protected routes

**Estimate:** 3 hours

---

### Phase 1 Total Estimate: 8-10 hours (1-2 days)

---

## Phase 2: Course Management (Days 4-6)
**Goal:** Enable course creation, enrollment, and management

### 2.1 Backend: Course Invitation System

**Tasks:**
1. Auto-generate invitation code on course creation
2. Add code regeneration endpoint
3. Ensure unique codes with retry logic

**Files:**
- `server/app/services/course.go:CreateCourse`
- `server/app/handlers/course.go`

**Implementation:**
```go
func generateInvitationCode() string {
    const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    b := make([]byte, 8)
    for i := range b {
        b[i] = charset[rand.Intn(len(charset))]
    }
    return string(b)
}

func (s *CourseService) CreateCourse(course *models.Course) error {
    // Generate unique code
    for {
        course.InvitationCode = generateInvitationCode()
        var existing models.Course
        if err := s.db.Where("invitation_code = ?", course.InvitationCode).First(&existing).Error; err != nil {
            break // Code is unique
        }
    }

    // Create course
    if err := s.db.Create(course).Error; err != nil {
        return err
    }

    // Auto-enroll creator as teacher
    enrollment := models.Enrollment{
        UserID:   course.CreatorID,
        CourseID: course.ID,
        Role:     "teacher",
        Status:   "approved",
    }
    return s.db.Create(&enrollment).Error
}
```

**Estimate:** 2 hours

---

### 2.2 Frontend: Course Creation UI

**New Component:** `client/src/components/courses/create/CreateCourse.tsx`

**Features:**
- Form with validation (name, description, dates, max students, difficulty, category)
- Submit to `POST /api/courses`
- Display invitation code after creation
- Copy code to clipboard

**Redux Integration:**
```typescript
// Add to store/courses/slice.ts
export const createCourse = createAsyncThunk(
  'courses/create',
  async (courseData: CreateCourseDTO) => {
    const response = await axios.post('/courses', courseData);
    return response.data;
  }
);
```

**Route:**
```typescript
// Add to router.tsx
<Route path="/courses/create" element={<CreateCourse />} />
```

**Estimate:** 4 hours

---

### 2.3 Frontend: Join Course by Code

**New Component:** `client/src/components/courses/JoinCourse.tsx`

**Features:**
- Input field for invitation code
- Submit to `POST /api/enrollments/join`
- Show "Pending approval" message
- Redirect to courses list

**Redux Integration:**
```typescript
// Add to store/enrollments/slice.ts (new)
export const joinCourse = createAsyncThunk(
  'enrollments/join',
  async (invitationCode: string) => {
    const response = await axios.post('/enrollments/join', { invitationCode });
    return response.data;
  }
);
```

**Add button in Header:** "Join Course" → opens modal

**Estimate:** 3 hours

---

### 2.4 Frontend: Enrollment Management

**Location:** `client/src/components/courses/people/CoursePeople.tsx`

**Features:**
- Tab 1: Enrolled students/teachers
- Tab 2: Pending requests (teachers only)
- Approve/Reject buttons
- Role badges

**Redux Integration:**
```typescript
// Update store/people/studentSlice.ts
export const fetchCourseStudents = createAsyncThunk(
  'students/fetch',
  async (courseId: string) => {
    const response = await axios.get(`/enrollments/course/${courseId}`);
    return response.data;
  }
);

export const approveEnrollment = createAsyncThunk(
  'students/approve',
  async (enrollmentId: number) => {
    await axios.put(`/enrollments/approve/${enrollmentId}`);
    return enrollmentId;
  }
);
```

**Estimate:** 5 hours

---

### 2.5 Frontend: Enable Course List Loading

**Files:**
- `client/src/components/courses/list/UserCourses.tsx:19`
- `client/src/components/dashboard/Dashboard.tsx:20`

**Changes:**
```typescript
// Change from:
const not = false;
if (not) { /* fetch */ }

// To:
useEffect(() => {
  dispatch(fetchUserCourses());
}, [dispatch]);
```

**Backend Endpoint:** Add `GET /users/courses` (from Phase 1.1)

**Estimate:** 1 hour

---

### Phase 2 Total Estimate: 15 hours (2-3 days)

---

## Phase 3: Assignment System (Days 7-10)
**Goal:** Full assignment lifecycle (create, publish, submit, grade)

### 3.1 Frontend: Connect Assignment Creation Form

**File:** `client/src/components/courses/create/CreateAssignment.tsx:49`

**Current Issue:** Only logs to console

**Fix:**
```typescript
const dispatch = useAppDispatch();
const navigate = useNavigate();

const handleSubmit = async (values: AssignmentFormValues) => {
  const formData = new FormData();
  formData.append('courseId', values.courseId);
  formData.append('title', values.title);
  formData.append('instructions', values.instructions);
  formData.append('dueDate', values.dueDate);
  formData.append('allowedFileExtensions', values.allowedExtensions.join(','));

  // Add files
  files.forEach(file => {
    formData.append('files', file);
  });

  try {
    await dispatch(createAssignment(formData)).unwrap();
    toast.success('Assignment created successfully');
    navigate(`/courses/${values.courseId}`);
  } catch (error) {
    toast.error('Failed to create assignment');
  }
};
```

**Estimate:** 2 hours

---

### 3.2 Frontend: Assignment List Pages

**New Components:**

#### A. Course Assignments Tab
**Location:** Add to `CourseOverview.tsx` tabs

**Features:**
- List all assignments for course
- Filter: Published only (for students), All (for teachers)
- Status badges: Upcoming, Overdue, Submitted, Graded
- Click to view details

**Estimate:** 3 hours

---

#### B. Assignment Detail Page
**New Route:** `/courses/:courseId/assignments/:assignmentId`

**Features:**
- Assignment title, instructions, due date
- Attached files (download links)
- For students: Submit button, submission status
- For teachers: View submissions button, publish/unpublish toggle

**Estimate:** 4 hours

---

### 3.3 Frontend: Student Submission Flow

**Component:** `client/src/components/student/activity/Assignment.tsx`

**Current Issue:** Line 15-23 only stores files locally

**Fix:**
```typescript
// New Redux action
export const submitAssignment = createAsyncThunk(
  'submissions/create',
  async ({ assignmentId, files }: { assignmentId: number, files: File[] }) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await axios.post(
      `/submissions/assignment/${assignmentId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Dispatch progress action
        }
      }
    );
    return response.data;
  }
);

// Update component
const handleSubmit = async () => {
  try {
    await dispatch(submitAssignment({ assignmentId, files })).unwrap();
    toast.success('Assignment submitted successfully');
  } catch (error) {
    toast.error('Submission failed');
  }
};
```

**Features to Add:**
- Upload progress bar
- Submit confirmation dialog
- View submitted files
- Draft saving
- Late submission warning

**Estimate:** 5 hours

---

### 3.4 Frontend: Teacher Grading Interface

**New Component:** `client/src/components/courses/grading/SubmissionGrading.tsx`

**Route:** `/courses/:courseId/assignments/:assignmentId/submissions`

**Features:**
- List all student submissions
- Submission status (submitted, late, graded)
- Download submitted files
- Grade input form (points, feedback)
- Submit grades

**Redux Integration:**
```typescript
// New slice: store/grades/slice.ts
export const gradeSubmission = createAsyncThunk(
  'grades/create',
  async (gradeData: GradeDTO) => {
    const response = await axios.post('/grades', gradeData);
    return response.data;
  }
);

export const fetchSubmissions = createAsyncThunk(
  'submissions/fetchByAssignment',
  async (assignmentId: number) => {
    const response = await axios.get(`/submissions/assignment/${assignmentId}`);
    return response.data;
  }
);
```

**Estimate:** 6 hours

---

### 3.5 Frontend: Publish/Unpublish Toggle

**Add to:** Assignment detail page (teacher view)

**Features:**
- Toggle switch
- Calls `POST /assignments/:id/publish` or `/unpublish`
- Shows publish date
- Confirmation dialog

**Estimate:** 2 hours

---

### 3.6 Frontend: Student Grades View

**New Component:** `client/src/components/student/grades/GradesList.tsx`

**Route:** `/grades`

**Features:**
- List all graded assignments
- Show: Assignment name, course, points earned, max points, grade %
- View feedback
- Filter by course

**Estimate:** 3 hours

---

### Phase 3 Total Estimate: 25 hours (3-4 days)

---

## Phase 4: Materials & Resources (Days 11-12)
**Goal:** Course materials upload, download, and management

### 4.1 Backend: Material List Endpoint

**Add to:** `server/app/routes/material.go`

```go
materialRouter.GET("/course/:courseId", handler.GetMaterialsByCourse)

// In handler
func (h *MaterialHandler) GetMaterialsByCourse(c *gin.Context) {
    courseID := c.Param("courseId")
    materials, err := h.service.GetByCourse(courseID)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, materials)
}
```

**Estimate:** 30 minutes

---

### 4.2 Frontend: Material Creation

**File:** `client/src/components/courses/create/CreateMaterial.tsx:49`

**Current Issue:** Only logs to console, no API integration

**Fix:**
```typescript
// Create Redux slice: store/materials/slice.ts
export const createMaterial = createAsyncThunk(
  'materials/create',
  async ({ courseId, title, description, files }: MaterialDTO) => {
    const formData = new FormData();
    formData.append('courseId', courseId);
    formData.append('title', title);
    formData.append('description', description);
    files.forEach(file => formData.append('files', file));

    const response = await axios.post('/materials', formData);
    return response.data;
  }
);

// Update component
const handleSubmit = async (values) => {
  await dispatch(createMaterial({ ...values, files })).unwrap();
  toast.success('Material uploaded');
};
```

**Estimate:** 3 hours

---

### 4.3 Frontend: Materials Display

**Location:** `client/src/components/courses/announcement/MaterialOverview.tsx`

**Current Issue:** Shows hardcoded data from `store/materials/slice.ts` examples array

**Fix:**
```typescript
// In CourseOverview.tsx
useEffect(() => {
  if (courseId) {
    dispatch(fetchMaterials(courseId));
  }
}, [courseId]);

// In MaterialOverview
const materials = useAppSelector(state => state.materials.list);
```

**Features:**
- List materials with icons by file type
- Download buttons
- Upload date and uploader name
- Delete button (teachers only)

**Estimate:** 2 hours

---

### 4.4 Frontend: Files Tab

**Location:** `client/src/components/courses/CourseOverview.tsx` (line 63 - empty tab)

**Features:**
- Combined view of all course files:
  - Materials
  - Assignment attachments
  - Student submissions (teachers only)
- Filter by type
- Sort by date/name/size
- Bulk download (zip)

**Estimate:** 5 hours

---

### Phase 4 Total Estimate: 10-11 hours (1-2 days)

---

## Phase 5: Quiz System (Days 13-16)
**Goal:** Complete quiz creation, taking, and grading

### 5.1 Backend: Quiz CRUD Endpoints

**File:** `server/app/handlers/quiz.go`

**Current State:**
- ✅ CreateQuiz implemented
- ❌ GetQuiz only prints ID (line 37)

**Add:**
```go
// GET /quizzes/:id - Get quiz details
func (h *QuizHandler) GetQuiz(c *gin.Context) {
    quizID := c.Param("id")
    quiz, err := h.service.GetQuiz(quizID)
    if err != nil {
        c.JSON(404, gin.H{"error": "Quiz not found"})
        return
    }
    c.JSON(200, quiz)
}

// PUT /quizzes/:id - Update quiz
// DELETE /quizzes/:id - Delete quiz
// GET /quizzes/course/:courseId - List quizzes for course
// POST /quizzes/:id/submit - Submit quiz attempt
// GET /quizzes/:id/results - Get quiz results
```

**Service Layer:** `server/app/services/quiz.go`
- Add all missing methods

**Estimate:** 4 hours

---

### 5.2 Frontend: Connect Quiz Creation Form

**File:** `client/src/components/courses/quiz/Quiz.tsx:201`

**Current Issue:** Only logs to console

**Fix:**
```typescript
const handleSaveQuiz = async () => {
  try {
    await dispatch(createQuiz({
      title: localQuiz.title,
      description: localQuiz.description,
      courseId: selectedCourseId,
      startTime: localQuiz.startTime,
      endTime: localQuiz.endTime,
      duration: localQuiz.duration,
      shuffleQuestions: localQuiz.shuffleQuestions,
      showResults: localQuiz.showResults,
      questions: localQuiz.questions
    })).unwrap();

    toast.success('Quiz created successfully');
    navigate(`/courses/${selectedCourseId}`);
  } catch (error) {
    toast.error('Failed to create quiz');
  }
};
```

**Note:** Redux actions already exist in `store/quiz/slice.ts` - just need to dispatch them!

**Estimate:** 2 hours

---

### 5.3 Frontend: Quiz List View

**Add to:** CourseOverview tabs or separate page

**Features:**
- List quizzes for course
- Status: Upcoming, Active, Completed
- For students: "Take Quiz" button (if active)
- For teachers: View submissions, statistics

**Estimate:** 3 hours

---

### 5.4 Frontend: Student Quiz Taking Interface

**New Component:** `client/src/components/student/quiz/TakeQuiz.tsx`

**Route:** `/courses/:courseId/quizzes/:quizId/take`

**Features:**
- Display questions one at a time or all at once
- Timer countdown
- Auto-submit on timeout
- Save progress
- Submit confirmation
- Navigation between questions

**Backend Endpoint Needed:**
```go
POST /quizzes/:id/attempts
// Start quiz attempt, track time

PUT /quizzes/attempts/:attemptId
// Save answers

POST /quizzes/attempts/:attemptId/submit
// Submit final answers
```

**Estimate:** 8 hours

---

### 5.5 Frontend: Quiz Results View

**Two Views:**

#### A. Student Results
**Route:** `/courses/:courseId/quizzes/:quizId/results`

**Features:**
- Score display
- Correct/incorrect answers (if showResults enabled)
- Time taken
- Percentage

**Estimate:** 3 hours

---

#### B. Teacher Analytics
**Route:** `/courses/:courseId/quizzes/:quizId/analytics`

**Features:**
- All student submissions
- Average score, highest, lowest
- Question-level statistics
- Export to CSV

**Estimate:** 4 hours

---

### Phase 5 Total Estimate: 24 hours (3-4 days)

---

## Phase 6: Enhanced Features (Days 17-20)
**Goal:** Improve UX, add notifications, calendar, polish

### 6.1 Notifications System

**Backend:**
- Create Notification model
- Add notification service
- Trigger events:
  - New assignment published
  - Submission graded
  - Course enrollment approved
  - Quiz available

**Frontend:**
- Notification dropdown in Header
- Badge with unread count
- Mark as read functionality
- Real-time updates (optional: WebSocket)

**Estimate:** 8 hours

---

### 6.2 Calendar Integration

**Component:** `client/src/components/courses/calendar/EventsCalendar.tsx`

**Features:**
- Display assignment due dates
- Display quiz times
- Color-coded by event type
- Click to view details
- Month/week/day views

**Library:** react-big-calendar or FullCalendar

**Estimate:** 6 hours

---

### 6.3 Dashboard Enhancements

**File:** `client/src/components/dashboard/Dashboard.tsx`

**Add:**
- Course progress bars (assignments completed %)
- Recent grades
- Activity feed
- Quick actions (Create course, Join course)
- Upcoming deadlines widget

**Enable API:** Remove `const notLogin = false` (line 20)

**Estimate:** 5 hours

---

### 6.4 Chat System (Optional)

**Scope:** Basic course discussion

**Backend:**
- Message model
- CRUD endpoints
- Room-based (course-level)

**Frontend:**
- Chat tab in CourseOverview
- Message list
- Send message form
- Real-time updates (WebSocket)

**Estimate:** 12 hours

---

### 6.5 Profile & Settings

**Features:**
- View/edit profile
- Change password
- Upload profile picture
- Account settings

**Backend:** Already exists
- `GET /users/profile`
- `PUT /users/profile`
- `POST /users/password/change` (route missing - add it)

**Frontend:** Create pages

**Estimate:** 4 hours

---

### 6.6 Search & Filters

**Features:**
- Global search (courses, assignments)
- Course filters (category, difficulty)
- Assignment filters (status, due date)

**Estimate:** 4 hours

---

### Phase 6 Total Estimate: 39 hours (5-6 days)

---

## Phase 7: Polish & Production Ready (Days 21-25)
**Goal:** Testing, optimization, deployment prep

### 7.1 Error Handling

**Backend:**
- Standardize error responses
- Add validation error messages
- Log errors properly

**Frontend:**
- Global error boundary
- User-friendly error messages
- Retry mechanisms
- Offline detection

**Estimate:** 6 hours

---

### 7.2 Loading States

**Add to all components:**
- Skeleton loaders
- Progress bars for uploads
- Optimistic UI updates
- Suspense fallbacks

**Estimate:** 4 hours

---

### 7.3 Validation

**Backend:**
- Input sanitization
- Request body validation (use validator package)
- File type/size validation
- Date validation

**Frontend:**
- Form validation (already partially done)
- File upload validation
- Client-side checks before API calls

**Estimate:** 6 hours

---

### 7.4 Security Hardening

**Tasks:**
- Rate limiting on all routes
- CSRF protection
- XSS prevention
- SQL injection prevention (GORM handles this)
- Password strength requirements
- Secure file uploads

**Estimate:** 6 hours

---

### 7.5 Performance Optimization

**Backend:**
- Database query optimization
- Add indexes
- Pagination on list endpoints
- Caching (Redis optional)

**Frontend:**
- Code splitting
- Lazy loading routes
- Image optimization
- Bundle size reduction
- API response caching

**Estimate:** 8 hours

---

### 7.6 Testing

**Backend:**
- Unit tests for services
- Integration tests for API endpoints
- E2E tests for critical flows

**Frontend:**
- Unit tests (Jest + React Testing Library)
- Component tests
- E2E tests (Playwright/Cypress)

**Estimate:** 16 hours

---

### 7.7 Documentation

**Create:**
- API documentation (Swagger/OpenAPI)
- User guide
- Developer setup guide
- Deployment instructions

**Estimate:** 6 hours

---

### 7.8 Deployment Setup

**Tasks:**
- Environment configuration
- Docker optimization
- CI/CD pipeline (GitHub Actions)
- Database migrations strategy
- SSL/TLS setup
- Monitoring & logging

**Estimate:** 8 hours

---

### Phase 7 Total Estimate: 60 hours (7-8 days)

---

## Implementation Priority Matrix

### Must Have (MVP)
1. ✅ Phase 0: Critical bug fixes
2. ✅ Phase 1: Backend infrastructure
3. ✅ Phase 2: Course management
4. ✅ Phase 3: Assignment system
5. ✅ Phase 4: Materials management

### Should Have (V1.0)
6. ✅ Phase 5: Quiz system
7. ⚠️ Phase 6: Notifications, Calendar, Dashboard
8. ⚠️ Phase 7.1-7.4: Error handling, validation, security

### Nice to Have (V1.1+)
9. 🔵 Phase 6.4: Chat system
10. 🔵 Phase 7.5: Performance optimization
11. 🔵 Phase 7.6: Comprehensive testing

---

## Timeline Summary

| Phase | Duration | Type | Priority |
|-------|----------|------|----------|
| Phase 0: Critical Fixes | 1 day | Fix | P0 |
| Phase 1: Backend Infrastructure | 2 days | Build | P0 |
| Phase 2: Course Management | 3 days | Build | P0 |
| Phase 3: Assignment System | 4 days | Build | P0 |
| Phase 4: Materials | 2 days | Build | P0 |
| **MVP Total** | **12 days** | | |
| Phase 5: Quiz System | 4 days | Build | P1 |
| Phase 6: Enhanced Features | 6 days | Polish | P1 |
| Phase 7: Production Ready | 8 days | Polish | P1 |
| **V1.0 Total** | **30 days** | | |

---

## Technology Stack Details

### Backend Dependencies
```go
// Current
github.com/gin-gonic/gin
gorm.io/gorm
gorm.io/driver/postgres
golang.org/x/crypto/bcrypt
github.com/golang-jwt/jwt/v5
firebase.google.com/go/v4

// Recommended to Add
github.com/go-playground/validator/v10  // Request validation
github.com/joho/godotenv                 // Better env management
github.com/stretchr/testify              // Testing
```

### Frontend Dependencies
```json
// Current
"react": "^18.x",
"react-router-dom": "^6.x",
"@reduxjs/toolkit": "^2.x",
"axios": "^1.x",
"@radix-ui/*": "latest",
"tailwindcss": "^4.x",
"framer-motion": "^11.x"

// Recommended to Add
"react-query": "^3.x",        // Better server state management
"zod": "^3.x",                // Runtime validation
"react-hook-form": "^7.x",    // Better form handling
"date-fns": "^2.x",           // Date manipulation
"react-big-calendar": "^1.x"  // Calendar view
```

---

## Common Pitfalls to Avoid

### 1. **Don't Skip Phase 0**
Critical bugs will block all development. Fix them first.

### 2. **Authorization First**
Add auth middleware before building features, not after.

### 3. **Test Enrollment Flow Early**
Course joining is critical - test it after Phase 2.

### 4. **File Upload Size Limits**
Set limits early to avoid storage issues:
```go
router.MaxMultipartMemory = 8 << 20  // 8 MB
```

### 5. **Database Migrations**
Never modify migration code after deployment. Use migration files.

### 6. **JWT Secret Management**
Use strong secrets, rotate regularly, never hardcode.

### 7. **CORS Configuration**
Review CORS settings before production deployment.

---

## Key Files Reference

### Critical Backend Files
```
server/app/
├── config/db.go                    # Database migration
├── routes/
│   ├── submission.go               # Missing POST route
│   ├── enrollment.go               # Hardcoded secret
│   ├── course.go                   # No auth
│   ├── assignment.go               # No auth
│   ├── material.go                 # No auth
│   └── grade.go                    # No auth
├── handlers/
│   ├── quiz.go                     # GetQuiz stubbed
│   └── submission.go               # CreateSubmission exists
├── services/
│   ├── course.go                   # Add code generation
│   └── quiz.go                     # Add missing methods
└── middlewares/
    └── auth.go                     # Working
```

### Critical Frontend Files
```
client/src/
├── App.tsx                         # Add token init
├── components/
│   ├── courses/
│   │   ├── create/
│   │   │   ├── CreateAssignment.tsx    # Line 49: no submit
│   │   │   ├── CreateMaterial.tsx      # Line 49: no submit
│   │   │   └── CreateCourse.tsx        # Missing entirely
│   │   ├── list/UserCourses.tsx        # Line 19: disabled
│   │   ├── CourseOverview.tsx          # Empty tabs
│   │   ├── people/CoursePeople.tsx     # No data fetch
│   │   └── quiz/Quiz.tsx               # Line 201: no submit
│   ├── dashboard/Dashboard.tsx         # Line 20: disabled
│   └── student/activity/Assignment.tsx # Line 15-23: local only
└── store/
    ├── materials/slice.ts              # Hardcoded data
    ├── people/studentSlice.ts          # No API
    └── quiz/slice.ts                   # Ready, unused
```

---

## Success Metrics

### Phase 0 Success Criteria
- [ ] All database tables created
- [ ] Login persists after page refresh
- [ ] All routes require authentication
- [ ] Submission route exists

### MVP Success Criteria
- [ ] Teacher can create course
- [ ] Student can join with code
- [ ] Teacher can approve students
- [ ] Teacher can create assignment
- [ ] Student can submit assignment
- [ ] Teacher can grade submission
- [ ] Student can view grades
- [ ] Materials can be uploaded/downloaded

### V1.0 Success Criteria
- [ ] Quiz full lifecycle works
- [ ] Notifications functional
- [ ] Calendar shows events
- [ ] All security checks in place
- [ ] Error handling comprehensive
- [ ] Performance optimized

---

## Next Steps

### Immediate Actions (Today)
1. Review this roadmap
2. Set up development environment
3. Create git branch for Phase 0
4. Start with database migration fix
5. Test each fix incrementally

### This Week
1. Complete Phase 0 (Day 1)
2. Start Phase 1 (Days 2-3)
3. Begin Phase 2 (Days 4+)

### This Month
1. Complete MVP (Phases 0-4)
2. Deploy to staging environment
3. User acceptance testing
4. Begin V1.0 features

---

## Support & Resources

### Documentation
- Gin: https://gin-gonic.com/docs/
- GORM: https://gorm.io/docs/
- React Router: https://reactrouter.com/
- Redux Toolkit: https://redux-toolkit.js.org/

### Community
- Create GitHub issues for bugs
- Use pull request templates
- Code review checklist
- Weekly progress updates

---

**Last Updated:** 2025-11-16
**Version:** 1.0
**Status:** Ready for Implementation
