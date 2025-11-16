import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Assignment } from "./type";
import {
  fetchAssignments,
  fetchCourseAssignments,
  fetchAssignmentById,
  createAssignment,
  deleteAssignment,
  publishAssignment,
  unpublishAssignment,
} from "./api";

interface AssignmentState {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  loading: boolean;
  error: string | null;
}

const initialState: AssignmentState = {
  assignments: [],
  currentAssignment: null,
  loading: false,
  error: null,
};

const assignmentSlice = createSlice({
  name: "assignments",
  initialState,
  reducers: {
    clearCurrentAssignment: (state) => {
      state.currentAssignment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all assignments
      .addCase(fetchAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAssignments.fulfilled,
        (state, action: PayloadAction<Assignment[]>) => {
          state.loading = false;
          state.assignments = action.payload;
        }
      )
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch course assignments
      .addCase(fetchCourseAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCourseAssignments.fulfilled,
        (state, action: PayloadAction<Assignment[]>) => {
          state.loading = false;
          state.assignments = action.payload;
        }
      )
      .addCase(fetchCourseAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single assignment
      .addCase(fetchAssignmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAssignmentById.fulfilled,
        (state, action: PayloadAction<Assignment>) => {
          state.loading = false;
          state.currentAssignment = action.payload;
        }
      )
      .addCase(fetchAssignmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create assignment
      .addCase(createAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments.push(action.payload);
      })
      .addCase(createAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Publish assignment
      .addCase(publishAssignment.fulfilled, (state, action: PayloadAction<number>) => {
        const assignment = state.assignments.find((a) => a.id === action.payload);
        if (assignment) {
          assignment.isPublished = true;
        }
        if (state.currentAssignment?.id === action.payload) {
          state.currentAssignment.isPublished = true;
        }
      })
      // Unpublish assignment
      .addCase(unpublishAssignment.fulfilled, (state, action: PayloadAction<number>) => {
        const assignment = state.assignments.find((a) => a.id === action.payload);
        if (assignment) {
          assignment.isPublished = false;
        }
        if (state.currentAssignment?.id === action.payload) {
          state.currentAssignment.isPublished = false;
        }
      })
      // Delete assignment
      .addCase(deleteAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteAssignment.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.loading = false;
          state.assignments = state.assignments.filter(
            (assignment) => assignment.id !== action.payload
          );
        }
      )
      .addCase(deleteAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentAssignment } = assignmentSlice.actions;

export default assignmentSlice.reducer;
