import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "@/components/ui/use-toast";
import { apiCall } from "../../api/server";
import { Submission } from "./type";

/**
 * Creates a new submission for an assignment.
 * @param payload - Object containing assignmentId and files
 * @returns A promise that resolves to the created Submission object.
 * @throws Will reject with an error if the creation fails.
 */
export const createSubmission = createAsyncThunk(
  "submissions/create",
  async (
    payload: { assignmentId: number; files: File[] },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      payload.files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await apiCall<{ submission: Submission }>({
        url: `/submissions/assignment/${payload.assignmentId}`,
        method: "POST",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({
        title: "Success",
        description: "Assignment submitted successfully",
      });

      return response.submission;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit assignment",
        variant: "destructive",
      });
      return rejectWithValue(error);
    }
  }
);

/**
 * Fetches all submissions for a specific assignment.
 * @param assignmentId - The ID of the assignment.
 * @returns A promise that resolves to an array of Submission objects.
 * @throws Will reject with an error if the fetch fails.
 */
export const fetchSubmissionsByAssignment = createAsyncThunk(
  "submissions/fetchByAssignment",
  async (assignmentId: number, { rejectWithValue }) => {
    try {
      return await apiCall<Submission[]>({
        url: `/submissions/assignment/${assignmentId}`,
        method: "GET",
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Fetches a single submission by ID.
 * @param id - The ID of the submission.
 * @returns A promise that resolves to a Submission object.
 * @throws Will reject with an error if the fetch fails.
 */
export const fetchSubmissionById = createAsyncThunk(
  "submissions/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await apiCall<Submission>({
        url: `/submissions/${id}`,
        method: "GET",
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Updates an existing submission with new files.
 * @param payload - Object containing submissionId and files
 * @returns A promise that resolves to the updated Submission object.
 * @throws Will reject with an error if the update fails.
 */
export const updateSubmission = createAsyncThunk(
  "submissions/update",
  async (
    payload: { submissionId: number; files: File[] },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      payload.files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await apiCall<Submission>({
        url: `/submissions/${payload.submissionId}`,
        method: "PUT",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({
        title: "Success",
        description: "Submission updated successfully",
      });

      return response;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update submission",
        variant: "destructive",
      });
      return rejectWithValue(error);
    }
  }
);

/**
 * Deletes a submission.
 * @param id - The ID of the submission to delete.
 * @returns A promise that resolves to the ID of the deleted submission.
 * @throws Will reject with an error if the deletion fails.
 */
export const deleteSubmission = createAsyncThunk(
  "submissions/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await apiCall({
        url: `/submissions/${id}`,
        method: "DELETE",
      });

      toast({
        title: "Success",
        description: "Submission deleted successfully",
      });

      return id;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete submission",
        variant: "destructive",
      });
      return rejectWithValue(error);
    }
  }
);
