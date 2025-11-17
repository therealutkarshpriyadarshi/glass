import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AssignmentOverview from "./AssignmentOverview";
import MaterialOverview from "./MaterialOverview";
import CourseHeader from "./CourseHeader";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { fetchCourseAssignments } from "../../../store/assignments/api";
import { fetchMaterialsByCourse } from "../../../store/materials/slice";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Announcement: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const dispatch = useAppDispatch();
  const { assignments, materials, assignmentsLoading, materialsLoading } = useAppSelector((state) => {
    return {
      assignments: state.assignments.assignments,
      materials: state.materials.materials,
      assignmentsLoading: state.assignments.loading,
      materialsLoading: state.materials.loading,
    };
  });
  const [isAssignment, setIsAssignment] = useState(true);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseAssignments(parseInt(courseId)));
      dispatch(fetchMaterialsByCourse(courseId));
    }
  }, [courseId, dispatch]);

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
          assignmentsLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading assignments...
            </div>
          ) : assignments.length > 0 ? (
            <AssignmentOverview assignments={assignments} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No assignments found for this course
            </div>
          )
        ) : materialsLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading materials...
          </div>
        ) : materials.length > 0 ? (
          <MaterialOverview materials={materials} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No materials found for this course
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcement;
