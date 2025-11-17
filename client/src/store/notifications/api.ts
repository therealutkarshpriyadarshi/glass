import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "@/components/ui/use-toast";
import { apiCall } from "../../api/server";
import {
  NotificationsResponse,
  UnreadNotificationsResponse,
  UnreadCountResponse,
} from "./type";

/**
 * Fetches all notifications for the authenticated user with pagination
 */
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (
    params: { limit?: number; offset?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.offset)
        queryParams.append("offset", params.offset.toString());

      const response = await apiCall<NotificationsResponse>({
        url: `/notifications?${queryParams.toString()}`,
        method: "GET",
      });

      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Fetches unread notifications for the authenticated user
 */
export const fetchUnreadNotifications = createAsyncThunk(
  "notifications/fetchUnread",
  async (_, { rejectWithValue }) => {
    try {
      return await apiCall<UnreadNotificationsResponse>({
        url: "/notifications/unread",
        method: "GET",
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Fetches the count of unread notifications
 */
export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      return await apiCall<UnreadCountResponse>({
        url: "/notifications/unread/count",
        method: "GET",
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Marks a specific notification as read
 */
export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId: number, { rejectWithValue }) => {
    try {
      await apiCall({
        url: `/notifications/${notificationId}/read`,
        method: "PUT",
      });

      return notificationId;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
      return rejectWithValue(error);
    }
  }
);

/**
 * Marks all notifications as read
 */
export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await apiCall({
        url: "/notifications/read-all",
        method: "PUT",
      });

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });

      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
      return rejectWithValue(error);
    }
  }
);

/**
 * Deletes a specific notification
 */
export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (notificationId: number, { rejectWithValue }) => {
    try {
      await apiCall({
        url: `/notifications/${notificationId}`,
        method: "DELETE",
      });

      toast({
        title: "Success",
        description: "Notification deleted",
      });

      return notificationId;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
      return rejectWithValue(error);
    }
  }
);
