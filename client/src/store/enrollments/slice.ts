import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiCall } from "../../api/server";

export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  role: "student" | "teacher" | "admin";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface EnrollmentsState {
  enrollments: Enrollment[];
  pendingEnrollments: Enrollment[];
  loading: boolean;
  error: string | null;
}

const initialState: EnrollmentsState = {
  enrollments: [],
  pendingEnrollments: [],
  loading: false,
  error: null,
};

// Join course by invitation code
export const joinCourse = createAsyncThunk(
  "enrollments/join",
  async ({ code, role }: { code: string; role: string }) => {
    return await apiCall<{ message: string }>({
      url: "/enrollments/join",
      method: "POST",
      data: { code, role },
    });
  }
);

// Fetch pending enrollments for a course (teachers only)
export const fetchPendingEnrollments = createAsyncThunk(
  "enrollments/fetchPending",
  async (courseId: number) => {
    const response = await apiCall<{ enrollments: Enrollment[] }>({
      url: `/enrollments/course/${courseId}`,
      method: "GET",
    });
    return response.enrollments;
  }
);

// Approve enrollment
export const approveEnrollment = createAsyncThunk(
  "enrollments/approve",
  async (enrollmentId: number) => {
    await apiCall({
      url: `/enrollments/approve/${enrollmentId}`,
      method: "PUT",
    });
    return enrollmentId;
  }
);

// Reject enrollment
export const rejectEnrollment = createAsyncThunk(
  "enrollments/reject",
  async (enrollmentId: number) => {
    await apiCall({
      url: `/enrollments/reject/${enrollmentId}`,
      method: "PUT",
    });
    return enrollmentId;
  }
);

// Fetch course students (approved enrollments)
export const fetchCourseStudents = createAsyncThunk(
  "enrollments/fetchStudents",
  async (courseId: number) => {
    const response = await apiCall<{ students: Enrollment[] }>({
      url: `/courses/${courseId}/students`,
      method: "GET",
    });
    return response.students;
  }
);

const enrollmentsSlice = createSlice({
  name: "enrollments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Join course
      .addCase(joinCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinCourse.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(joinCourse.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ?? "Failed to join course";
      })
      // Fetch pending enrollments
      .addCase(fetchPendingEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingEnrollments = action.payload;
      })
      .addCase(fetchPendingEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ?? "Failed to fetch pending enrollments";
      })
      // Approve enrollment
      .addCase(approveEnrollment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveEnrollment.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingEnrollments = state.pendingEnrollments.filter(
          (e) => e.id !== action.payload
        );
      })
      .addCase(approveEnrollment.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ?? "Failed to approve enrollment";
      })
      // Reject enrollment
      .addCase(rejectEnrollment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectEnrollment.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingEnrollments = state.pendingEnrollments.filter(
          (e) => e.id !== action.payload
        );
      })
      .addCase(rejectEnrollment.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ?? "Failed to reject enrollment";
      })
      // Fetch course students
      .addCase(fetchCourseStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = action.payload;
      })
      .addCase(fetchCourseStudents.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ?? "Failed to fetch course students";
      });
  },
});

export const { clearError } = enrollmentsSlice.actions;
export default enrollmentsSlice.reducer;
