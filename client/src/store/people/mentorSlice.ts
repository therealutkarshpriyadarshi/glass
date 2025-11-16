import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Mentor } from "./type";

interface MentorState {
  mentors: Mentor[];
}

const initialState: MentorState = {
  mentors: [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      profilePictureUrl: "https://example.com/john.jpg",
    },
  ],
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
