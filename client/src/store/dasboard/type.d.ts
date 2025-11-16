export interface Assignment {
  id: number;
  title: string;
  dueDate: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
}

export interface CourseStats {
  activeCourses: number;
  upcomingAssignments: number;
  newMessages: number;
}
