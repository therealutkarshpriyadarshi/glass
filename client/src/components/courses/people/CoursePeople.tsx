import React from "react";
import CourseMentors from "./CourseMentors";
import CourseStudents from "./CourseStudents";
import { useAppSelector } from "../../../store/hooks";

const CoursePeople: React.FC = () => {
  const mentors = useAppSelector((state) => state.mentors.mentors);
  const students = useAppSelector((state) => state.students.students);
  return (
    <div className="space-y-4">
      <CourseMentors mentors={mentors} />
      <CourseStudents students={students} />
    </div>
  );
};

export default CoursePeople;
