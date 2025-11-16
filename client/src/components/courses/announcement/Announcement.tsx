import React, { useState } from "react";
import AssignmentOverview from "./AssignmentOverview";
import MaterialOverview from "./MaterialOverview";
import CourseHeader from "./CourseHeader";
import { useAppSelector } from "../../../store/hooks";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Announcement: React.FC = () => {
  const { assignments, materials } = useAppSelector((state) => {
    return {
      assignments: state.assignments.assignments,
      materials: state.materials.materials,
    };
  });
  const [isAssignment, setIsAssignment] = useState(true);

  return (
    <div className="mt-2 space-y-4">
      <CourseHeader title="Announcements" />

      <div className="flex justify-end">
        <Tabs
          value={isAssignment ? "assignments" : "materials"}
          onValueChange={(value) => setIsAssignment(value === "assignments")}
        >
          <TabsList>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div>
        {isAssignment ? (
          <AssignmentOverview assignments={assignments} />
        ) : (
          <MaterialOverview materials={materials} />
        )}
      </div>
    </div>
  );
};

export default Announcement;
