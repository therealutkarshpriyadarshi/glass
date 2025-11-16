import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Assignment, Announcement, CourseStats } from "./type";
import { apiCall } from "../../api/server";

interface DashboardState {
  upcomingAssignments: Assignment[];
  recentAnnouncements: Announcement[];
  courseStats: CourseStats;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  upcomingAssignments: [],
  recentAnnouncements: [],
  courseStats: {
    activeCourses: 0,
    upcomingAssignments: 0,
    newMessages: 0,
  },
  isLoading: false,
  error: null,
};

export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchData",
  async () => {
    const response = await apiCall<DashboardState>({
      url: "/dashboard",
      method: "GET",
    });
    return response;
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchDashboardData.fulfilled,
        (state, action: PayloadAction<DashboardState>) => {
          const { payload } = action;
          const { upcomingAssignments, recentAnnouncements, courseStats } =
            payload;
          state.isLoading = false;
          state.upcomingAssignments = upcomingAssignments;
          state.recentAnnouncements = recentAnnouncements;
          state.courseStats = courseStats;
        }
      )
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "An error occurred";
      });
  },
});

export default dashboardSlice.reducer;
