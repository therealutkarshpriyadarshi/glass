import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Grade } from "./type";
import { createGrade, updateGrade, fetchGradesByUser } from "./api";

interface GradeState {
  grades: Grade[];
  loading: boolean;
  error: string | null;
}

const initialState: GradeState = {
  grades: [],
  loading: false,
  error: null,
};

const gradeSlice = createSlice({
  name: "grades",
  initialState,
  reducers: {
    clearGrades: (state) => {
      state.grades = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Create grade
      .addCase(createGrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGrade.fulfilled, (state, action: PayloadAction<Grade>) => {
        state.loading = false;
        state.grades.push(action.payload);
      })
      .addCase(createGrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update grade
      .addCase(updateGrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGrade.fulfilled, (state, action: PayloadAction<Grade>) => {
        state.loading = false;
        const index = state.grades.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          state.grades[index] = action.payload;
        }
      })
      .addCase(updateGrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch grades by user
      .addCase(fetchGradesByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchGradesByUser.fulfilled,
        (state, action: PayloadAction<Grade[]>) => {
          state.loading = false;
          state.grades = action.payload;
        }
      )
      .addCase(fetchGradesByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearGrades } = gradeSlice.actions;

export default gradeSlice.reducer;
