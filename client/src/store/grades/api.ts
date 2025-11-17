import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "@/components/ui/use-toast";
import { apiCall } from "../../api/server";
import { Grade, GradeInput } from "./type";

/**
 * Creates a new grade for a submission.
 * @param gradeInput - The grade data including submissionId, pointsEarned, and feedback
 * @returns A promise that resolves to the created Grade object.
 * @throws Will reject with an error if the creation fails.
 */
export const createGrade = createAsyncThunk(
  "grades/create",
  async (gradeInput: GradeInput, { rejectWithValue }) => {
    try {
      const response = await apiCall<Grade>({
        url: "/grades",
        method: "POST",
        data: gradeInput,
      });

      toast({
        title: "Success",
        description: "Grade submitted successfully",
      });

      return response;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit grade",
        variant: "destructive",
      });
      return rejectWithValue(error);
    }
  }
);

/**
 * Updates an existing grade.
 * @param payload - Object containing gradeId, pointsEarned, and feedback
 * @returns A promise that resolves to the updated Grade object.
 * @throws Will reject with an error if the update fails.
 */
export const updateGrade = createAsyncThunk(
  "grades/update",
  async (
    payload: { gradeId: number; pointsEarned: number; feedback?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiCall<Grade>({
        url: `/grades/${payload.gradeId}`,
        method: "PUT",
        data: {
          pointsEarned: payload.pointsEarned,
          feedback: payload.feedback,
        },
      });

      toast({
        title: "Success",
        description: "Grade updated successfully",
      });

      return response;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update grade",
        variant: "destructive",
      });
      return rejectWithValue(error);
    }
  }
);

/**
 * Fetches all grades for a specific user.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of Grade objects.
 * @throws Will reject with an error if the fetch fails.
 */
export const fetchGradesByUser = createAsyncThunk(
  "grades/fetchByUser",
  async (userId: number, { rejectWithValue }) => {
    try {
      return await apiCall<Grade[]>({
        url: `/grades/user/${userId}`,
        method: "GET",
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
