import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "@/components/ui/use-toast";
import { apiCall } from "../../api/server";
import { Assignment } from "./type";

/**
 * Creates a new assignment.
 * @param formData - The form data containing assignment details.
 * @returns A promise that resolves to the created Assignment object.
 * @throws Will reject with an error if the creation fails.
 */
export const createAssignment = createAsyncThunk(
  "assignments/create",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await apiCall<Assignment>({
        url: "/assignments",
        method: "POST",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast({
        title: "Success",
        description: "Assignment created successfully",
      });
      return response;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive",
      });
      return rejectWithValue(error);
    }
  }
);

/**
 * Fetches all assignments.
 * @returns A promise that resolves to an array of Assignment objects.
 * @throws Will reject with an error if the fetch fails.
 */
export const fetchAssignments = createAsyncThunk(
  "assignments/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await apiCall<Assignment[]>({
        url: "/assignments",
        method: "GET",
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Deletes an assignment.
 * @param id - The ID of the assignment to delete.
 * @returns A promise that resolves to the ID of the deleted assignment.
 * @throws Will reject with an error if the deletion fails.
 */
export const deleteAssignment = createAsyncThunk(
  "assignments/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await apiCall({ url: `/assignments/${id}`, method: "DELETE" });
      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });
      return id;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive",
      });
      return rejectWithValue(error);
    }
  }
);
