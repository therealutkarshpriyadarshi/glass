import { configureStore } from "@reduxjs/toolkit";
import mentorReducer from "./people/mentorSlice";
import studentReducer from "./people/studentSlice";
import authReducer from "./auth/authSlice";
import assignmentReducer from "./assignments/slice";
import activityAssignmentReducer from "./activity/assignmentSlice";
import dashboardReducer from "./dashboard/slice";
import coursesReducer from "./courses/slice";
import materialReducer from "./materials/slice";
import quizReducer from "./quiz/slice";
import enrollmentsReducer from "./enrollments/slice";
import submissionsReducer from "./submissions/slice";
import gradesReducer from "./grades/slice";

const store = configureStore({
  reducer: {
    mentors: mentorReducer,
    students: studentReducer,
    assignments: assignmentReducer,
    activityAssignment: activityAssignmentReducer,
    auth: authReducer,
    dashboard: dashboardReducer,
    courses: coursesReducer,
    materials: materialReducer,
    quizzes: quizReducer,
    enrollments: enrollmentsReducer,
    submissions: submissionsReducer,
    grades: gradesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
