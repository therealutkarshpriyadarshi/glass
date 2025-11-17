import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import type { Quiz, Question } from "./type";
import { apiCall } from "../../api/server";

export const fetchQuizzes = createAsyncThunk(
  "quizzes/fetchQuizzes",
  async () => {
    return await apiCall<Quiz[]>({ url: "/quizzes", method: "GET" });
  }
);

export const fetchQuizById = createAsyncThunk(
  "quizzes/fetchQuizById",
  async (id: number) => {
    return await apiCall<Quiz>({ url: `/quizzes/${id}`, method: "GET" });
  }
);

export const fetchQuizzesByCourse = createAsyncThunk(
  "quizzes/fetchQuizzesByCourse",
  async (courseId: number) => {
    const response = await apiCall<{ quizzes: Quiz[] }>({
      url: `/quizzes/course/${courseId}`,
      method: "GET"
    });
    return response.quizzes;
  }
);

export const createQuiz = createAsyncThunk(
  "quizzes/createQuiz",
  async (quiz: Omit<Quiz, "id">) => {
    const response = await apiCall<{ quiz: Quiz }>({ url: "/quizzes", method: "POST", data: quiz });
    return response.quiz;
  }
);

export const updateQuiz = createAsyncThunk(
  "quizzes/updateQuiz",
  async (quiz: Quiz) => {
    return await apiCall<Quiz>({
      url: `/quizzes/${quiz.id}`,
      method: "PUT",
      data: quiz,
    });
  }
);

export const deleteQuiz = createAsyncThunk(
  "quizzes/deleteQuiz",
  async (id: number) => {
    await apiCall({ url: `/quizzes/${id}`, method: "DELETE" });
    return id;
  }
);

export const addQuestion = createAsyncThunk(
  "quizzes/addQuestion",
  async ({
    quizId,
    question,
  }: {
    quizId: number;
    question: Omit<Question, "id">;
  }) => {
    return await apiCall<Question>({
      url: `/quizzes/${quizId}/questions`,
      method: "POST",
      data: question,
    });
  }
);

export const updateQuestion = createAsyncThunk(
  "quizzes/updateQuestion",
  async (question: Question) => {
    return await apiCall<Question>({
      url: `/quizzes/questions/${question.id}`,
      method: "PUT",
      data: question,
    });
  }
);

export const deleteQuestion = createAsyncThunk(
  "quizzes/deleteQuestion",
  async (id: number) => {
    await apiCall({ url: `/quizzes/questions/${id}`, method: "DELETE" });
    return id;
  }
);

interface QuizState {
  list: Quiz[];
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: QuizState = {
  list: [],
  quizzes: [],
  currentQuiz: null,
  loading: false,
  isLoading: false,
  error: null,
};

const quizSlice = createSlice({
  name: "quizzes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        fetchQuizzes.fulfilled,
        (state, action: PayloadAction<Quiz[]>) => {
          state.isLoading = false;
          state.quizzes = action.payload;
        }
      )
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch quizzes";
      })
      .addCase(
        fetchQuizById.fulfilled,
        (state, action: PayloadAction<Quiz>) => {
          state.currentQuiz = action.payload;
        }
      )
      .addCase(fetchQuizzesByCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchQuizzesByCourse.fulfilled,
        (state, action: PayloadAction<Quiz[]>) => {
          state.loading = false;
          state.list = action.payload;
        }
      )
      .addCase(fetchQuizzesByCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch quizzes";
      })
      .addCase(createQuiz.fulfilled, (state, action: PayloadAction<Quiz>) => {
        state.quizzes.push(action.payload);
        state.list.push(action.payload);
      })
      .addCase(updateQuiz.fulfilled, (state, action: PayloadAction<Quiz>) => {
        const index = state.quizzes.findIndex(
          (quiz) => quiz.id === action.payload.id
        );
        if (index !== -1) {
          state.quizzes[index] = action.payload;
        }
        if (state.currentQuiz?.id === action.payload.id) {
          state.currentQuiz = action.payload;
        }
      })
      .addCase(deleteQuiz.fulfilled, (state, action: PayloadAction<number>) => {
        state.quizzes = state.quizzes.filter(
          (quiz) => quiz.id !== action.payload
        );
        if (state.currentQuiz?.id === action.payload) {
          state.currentQuiz = null;
        }
      })
      .addCase(
        addQuestion.fulfilled,
        (state, action: PayloadAction<Question>) => {
          if (state.currentQuiz) {
            state.currentQuiz.questions.push(action.payload);
          }
        }
      )
      .addCase(
        updateQuestion.fulfilled,
        (state, action: PayloadAction<Question>) => {
          if (state.currentQuiz) {
            const index = state.currentQuiz.questions.findIndex(
              (q) => q.id === action.payload.id
            );
            if (index !== -1) {
              state.currentQuiz.questions[index] = action.payload;
            }
          }
        }
      )
      .addCase(
        deleteQuestion.fulfilled,
        (state, action: PayloadAction<number>) => {
          if (state.currentQuiz) {
            state.currentQuiz.questions = state.currentQuiz.questions.filter(
              (q) => q.id !== action.payload
            );
          }
        }
      );
  },
});

export default quizSlice.reducer;
