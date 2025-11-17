import { createSlice } from "@reduxjs/toolkit";
import { Notification } from "./type";
import {
  fetchNotifications,
  fetchUnreadNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "./api";

interface NotificationsState {
  notifications: Notification[];
  unreadNotifications: Notification[];
  unreadCount: number;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadNotifications: [],
  unreadCount: 0,
  total: 0,
  loading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadNotifications = [];
      state.unreadCount = 0;
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch all notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.total = action.payload.total;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch unread notifications
    builder
      .addCase(fetchUnreadNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnreadNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadNotifications = action.payload.notifications;
        state.unreadCount = action.payload.count;
      })
      .addCase(fetchUnreadNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch unread count
    builder
      .addCase(fetchUnreadCount.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Mark notification as read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;

        // Update in notifications array
        const notification = state.notifications.find(
          (n) => n.id === notificationId
        );
        if (notification) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
        }

        // Remove from unread notifications
        state.unreadNotifications = state.unreadNotifications.filter(
          (n) => n.id !== notificationId
        );

        // Decrement unread count
        if (state.unreadCount > 0) {
          state.unreadCount--;
        }
      });

    // Mark all notifications as read
    builder
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        // Mark all notifications as read
        state.notifications = state.notifications.map((n) => ({
          ...n,
          isRead: true,
          readAt: n.readAt || new Date().toISOString(),
        }));

        // Clear unread notifications
        state.unreadNotifications = [];
        state.unreadCount = 0;
      });

    // Delete notification
    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notificationId = action.payload;

        // Check if it was unread before deletion
        const wasUnread = state.notifications.find(
          (n) => n.id === notificationId
        )?.isRead === false;

        // Remove from notifications
        state.notifications = state.notifications.filter(
          (n) => n.id !== notificationId
        );

        // Remove from unread notifications
        state.unreadNotifications = state.unreadNotifications.filter(
          (n) => n.id !== notificationId
        );

        // Decrement counts
        state.total = Math.max(0, state.total - 1);
        if (wasUnread && state.unreadCount > 0) {
          state.unreadCount--;
        }
      });
  },
});

export const { clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
