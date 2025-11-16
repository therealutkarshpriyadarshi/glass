export interface Grade {
  id: number;
  submissionId: number;
  gradedBy: number;
  pointsEarned: number;
  feedback: string;
  gradedAt: string;
}

export interface GradeInput {
  submissionId: number;
  pointsEarned: number;
  feedback?: string;
}
