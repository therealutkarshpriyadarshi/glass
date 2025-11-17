import { createBrowserRouter } from "react-router-dom";
import Layout from "./Layout";
import Auth from "./components/auth/Auth";
import NotFound from "./components/error/NotFound";
import Dashboard from "./components/dashboard/Dashboard";
import UserCourses from "./components/courses/list/UserCourses";
import CourseOverview from "./components/courses/CourseOverview";
import CreateCourseComponent from "./components/courses/create/CreateCourseComponent";
import CreateCourse from "./components/courses/create/CreateCourse";
import AssignmentDetail from "./components/courses/assignment/AssignmentDetail";
import SubmitAssignment from "./components/courses/assignment/SubmitAssignment";
import SubmissionsList from "./components/courses/assignment/SubmissionsList";
import GradesList from "./components/student/grades/GradesList";
import QuizDetail from "./components/courses/quiz/QuizDetail";
import TakeQuiz from "./components/student/quiz/TakeQuiz";
import QuizResults from "./components/student/quiz/QuizResults";
import QuizAnalytics from "./components/courses/quiz/QuizAnalytics";
import SuspenseWrapper from "./SuspenseWrapper";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <Dashboard />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "/courses",
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <UserCourses />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "/courses/new",
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <CreateCourse />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "/courses/create",
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <CreateCourseComponent />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "/courses/:courseId",
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <CourseOverview />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "/courses/:courseId/assignments/:assignmentId",
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <AssignmentDetail />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "/courses/:courseId/assignments/:assignmentId/submit",
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <SubmitAssignment />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "/courses/:courseId/assignments/:assignmentId/submissions",
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <SubmissionsList />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "/grades",
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <GradesList />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "/courses/:courseId/quizzes/:quizId",
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <QuizDetail />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "/courses/:courseId/quizzes/:quizId/take",
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <TakeQuiz />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "/courses/:courseId/quizzes/:quizId/results",
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <QuizResults />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "/courses/:courseId/quizzes/:quizId/analytics",
        element: (
          <ProtectedRoute>
            <SuspenseWrapper>
              <QuizAnalytics />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: (
      <SuspenseWrapper>
        <Auth />
      </SuspenseWrapper>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
