import React from "react";
import type { Student } from "../../../store/people/type";
import Template from "./Template";

interface CourseStudentsProps {
  students: Student[];
}

const CourseStudents: React.FC<CourseStudentsProps> = ({ students }) => {
  return <Template title="Students" data={students} />;
};

export default CourseStudents;
