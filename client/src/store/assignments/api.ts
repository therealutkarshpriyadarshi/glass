import { createAsyncThunk } from "@reduxjs/toolkit";
import { message } from "antd";
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
      message.success("Assignment created successfully");
      return response;
    } catch (error) {
      message.error("Failed to create assignment");
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
      message.success("Assignment deleted successfully");
      return id;
    } catch (error) {
      message.error("Failed to delete assignment");
      return rejectWithValue(error);
    }
  }
);
