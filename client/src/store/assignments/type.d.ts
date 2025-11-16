export interface Assignment {
  id: number;
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  startTime: string;
  endTime: string;
  courseId: number;
  maxAttempts: number;
  gradingType: "points" | "percentage" | "passFail";
  totalPoints: number;
  allowedFileExtensions: string[];
  maxFileSize: number;
  isGroupAssignment: boolean;
  isPeerReviewEnabled: boolean;
  isPublished: boolean;
}

export interface AssignmentBasic {
  id: number;
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  startTime: string;
  endTime: string;
}
