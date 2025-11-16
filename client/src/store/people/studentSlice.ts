import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Student } from "./type";
import students from "../../examples/students";

interface StudentState {
  students: Student[];
}

const initialState: StudentState = {
  students: students,
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setStudents: (state, action: PayloadAction<Student[]>) => {
      state.students = action.payload;
    },
  },
});

export const { setStudents } = studentSlice.actions;

export default studentSlice.reducer;
