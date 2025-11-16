import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Submission } from "./type";
import {
  createSubmission,
  fetchSubmissionsByAssignment,
  fetchSubmissionById,
  updateSubmission,
  deleteSubmission,
} from "./api";

interface SubmissionState {
  submissions: Submission[];
  currentSubmission: Submission | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubmissionState = {
  submissions: [],
  currentSubmission: null,
  loading: false,
  error: null,
};

const submissionSlice = createSlice({
  name: "submissions",
  initialState,
  reducers: {
    clearCurrentSubmission: (state) => {
      state.currentSubmission = null;
    },
    clearSubmissions: (state) => {
      state.submissions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Create submission
      .addCase(createSubmission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createSubmission.fulfilled,
        (state, action: PayloadAction<Submission>) => {
          state.loading = false;
          state.submissions.push(action.payload);
          state.currentSubmission = action.payload;
        }
      )
      .addCase(createSubmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch submissions by assignment
      .addCase(fetchSubmissionsByAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSubmissionsByAssignment.fulfilled,
        (state, action: PayloadAction<Submission[]>) => {
          state.loading = false;
          state.submissions = action.payload;
        }
      )
      .addCase(fetchSubmissionsByAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single submission
      .addCase(fetchSubmissionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSubmissionById.fulfilled,
        (state, action: PayloadAction<Submission>) => {
          state.loading = false;
          state.currentSubmission = action.payload;
        }
      )
      .addCase(fetchSubmissionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update submission
      .addCase(updateSubmission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateSubmission.fulfilled,
        (state, action: PayloadAction<Submission>) => {
          state.loading = false;
          const index = state.submissions.findIndex(
            (s) => s.id === action.payload.id
          );
          if (index !== -1) {
            state.submissions[index] = action.payload;
          }
          state.currentSubmission = action.payload;
        }
      )
      .addCase(updateSubmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete submission
      .addCase(deleteSubmission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteSubmission.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.loading = false;
          state.submissions = state.submissions.filter(
            (s) => s.id !== action.payload
          );
          if (state.currentSubmission?.id === action.payload) {
            state.currentSubmission = null;
          }
        }
      )
      .addCase(deleteSubmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentSubmission, clearSubmissions } =
  submissionSlice.actions;

export default submissionSlice.reducer;
