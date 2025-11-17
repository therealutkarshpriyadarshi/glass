export type NotificationType =
  | "assignment_published"
  | "submission_graded"
  | "enrollment_approved"
  | "enrollment_rejected"
  | "quiz_available"
  | "quiz_graded"
  | "course_updated";

export interface Notification {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: NotificationType;
  isRead: boolean;
  readAt: string | null;
  relatedId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  limit: number;
  offset: number;
}

export interface UnreadNotificationsResponse {
  notifications: Notification[];
  count: number;
}

export interface UnreadCountResponse {
  count: number;
}
