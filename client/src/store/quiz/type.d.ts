export interface Question {
  id?: number;
  title: string;
  description: string;
  type: "single_correct" | "multi_correct";
  points: number;
  options: Option[];
}

export interface Option {
  id?: number;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id?: number;
  title: string;
  description: string;
  type: "single_correct" | "multi_correct";
  points: number;
  options: Option[];
}

export interface Quiz {
  id?: number;
  title: string;
  description: string;
  courseId: number;
  startTime: string;
  endTime: string;
  duration: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  questions: Question[];
}
