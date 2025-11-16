import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiCall } from "../../api/server";
import type { Course } from "./types";

interface CoursesState {
  courses: Course[];
  loading: boolean;
  error: string | null;
}

const initialState: CoursesState = {
  courses: [],
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
