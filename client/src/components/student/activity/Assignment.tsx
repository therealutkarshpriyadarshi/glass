import React from "react";
import { Upload, Button } from "antd";
import type { Assignment } from "../../../store/activity/type";
import ActivityTemplate from "./ActivityTemplate";
import { useAppSelector } from "../../../store/hooks";

const Assignment: React.FC = () => {
  const assignment = useAppSelector(
    ({ assignments }) => assignments.assignment
  );

  return assignment ? (
    <ActivityTemplate activity={assignment}>
      <Upload>
        <Button>Upload</Button>
      </Upload>
    </ActivityTemplate>
  ) : (
    <div>No assignment found</div>
  );
};

export default Assignment;
