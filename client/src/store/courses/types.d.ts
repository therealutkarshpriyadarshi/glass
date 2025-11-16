export interface Course {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  difficulty: string;
  category: string;
  isActive: boolean;
}

export interface CourseBasic {
  id: string;
  title: string;
  creator: string;
  subject: string;
  description: string;
}
