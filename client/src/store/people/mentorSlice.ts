import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Mentor } from "./type";

interface MentorState {
  mentors: Mentor[];
}

const initialState: MentorState = {
  mentors: [],
};

const mentorSlice = createSlice({
  name: "mentor",
  initialState,
  reducers: {
    setMentors: (state, action: PayloadAction<Mentor[]>) => {
      state.mentors = action.payload;
    },
  },
});

export const { setMentors } = mentorSlice.actions;

export default mentorSlice.reducer;
