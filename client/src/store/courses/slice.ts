import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiCall } from "../../api/server";
import type { Course } from "./types";

interface CoursesState {
  courses: Course[];
  loading: boolean;
  error: string | null;
}

const courseExamples: Course[] = [
  {
    id: 1,
    name: "Introduction to Programming",
    description: "Learn the basics of programming with JavaScript",
    startDate: "2023-09-01",
    endDate: "2023-12-15",
    maxStudents: 30,
    difficulty: "Beginner",
    category: "Computer Science",
    isActive: true,
  },
  {
    id: 2,
    name: "Advanced Machine Learning",
    description: "Explore advanced topics in machine learning and AI",
    startDate: "2023-10-01",
    endDate: "2024-03-31",
    maxStudents: 20,
    difficulty: "Advanced",
    category: "Artificial Intelligence",
    isActive: true,
  },
  {
    id: 3,
    name: "Data Structures and Algorithms",
    description: "Master the fundamentals of data structures and algorithms",
    startDate: "2023-11-01",
    endDate: "2024-04-30",
    maxStudents: 25,
    difficulty: "Intermediate",
    category: "Computer Science",
    isActive: true,
  },
];

const initialState: CoursesState = {
  courses: courseExamples,
  loading: false,
  error: null,
};

export const fetchUserCourses = createAsyncThunk(
  "courses/fetchUserCourses",
  async () => {
    return await apiCall<Course[]>({
      url: "/users/courses",
      method: "GET",
    });
  }
);

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchUserCourses.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ?? "An error occurred while fetching courses";
      });
  },
});

export default coursesSlice.reducer;
