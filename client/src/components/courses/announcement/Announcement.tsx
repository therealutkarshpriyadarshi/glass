import React, { useState } from "react";
import { Segmented, Row, Col } from "antd";
import AssignmentOverview from "./AssignmentOverview";
import MaterialOverview from "./MaterialOverview";
import CourseHeader from "./CourseHeader";
import { useAppSelector } from "../../../store/hooks";

const Announcement: React.FC = () => {
  const { assignments, materials } = useAppSelector((state) => {
    return {
      assignments: state.assignments.assignments,
      materials: state.materials.materials,
    };
  });
  const [isAssignment, setIsAssignment] = useState(true);

  return (
    <Row
      gutter={[16, 16]}
      style={{
        marginTop: "10px",
      }}
    >
      <Col span={24}>
        <CourseHeader title="Announcements" />
      </Col>

      <Col span={18} />

      <Col span={6}>
        <Segmented
          options={["Assignments", "Materials"]}
          onChange={(value) => setIsAssignment(value === "Assignments")}
        />
      </Col>

      <Col span={24}>
        {isAssignment ? (
          <AssignmentOverview assignments={assignments} />
        ) : (
          <MaterialOverview materials={materials} />
        )}
      </Col>
    </Row>
  );
};

export default Announcement;
