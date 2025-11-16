import React from "react";
import CourseMentors from "./CourseMentors";
import CourseStudents from "./CourseStudents";
import { useAppSelector } from "../../../store/hooks";
import { Row, Col } from "antd";


const CoursePeople: React.FC = () => {
  const mentors = useAppSelector((state) => state.mentors.mentors);
  const students = useAppSelector((state) => state.students.students);
  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <CourseMentors mentors={mentors} />
      </Col>
      <Col span={24}>
        <CourseStudents students={students} />
      </Col>
    </Row>
  );
};

export default CoursePeople;
