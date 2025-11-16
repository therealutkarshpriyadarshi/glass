export type SubmissionStatus = "draft" | "submitted" | "late" | "graded";

export interface SubmissionFile {
  id: number;
  fileName: string;
  fileUrl: string;
  extension: string;
  userFileName: string;
}

export interface Submission {
  id: number;
  assignmentId: number;
  userId: number;
  submittedAt: string;
  files: SubmissionFile[];
  status: SubmissionStatus;
  grade?: {
    id: number;
    points: number;
    feedback: string;
  };
}
