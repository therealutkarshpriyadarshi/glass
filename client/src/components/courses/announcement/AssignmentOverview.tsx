import React from "react";
import { FileText, Calendar } from "lucide-react";
import type { AssignmentBasic } from "../../../store/assignments/type";
import { Avatar } from "@/components/ui/avatar";

interface AssignmentOverviewProps {
  assignments: AssignmentBasic[];
}

/**
 * AssignmentOverview component displays a list of assignments.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {AssignmentBasic[]} props.assignments - An array of assignment objects to be displayed.
 * @returns {React.FC} A list of assignments.
 */
const AssignmentOverview: React.FC<AssignmentOverviewProps> = ({
  assignments,
}) => {
  return (
    <div className="space-y-0">
      {assignments.map((assignment, index) => (
        <div
          key={index}
          className="p-4 border-b border-border transition-colors hover:bg-accent/50 cursor-pointer"
        >
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10 flex items-center justify-center bg-primary">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-semibold text-foreground mb-2">
                {assignment.title}
              </h4>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Due: {assignment.dueDate}
                </p>
                <p className="text-sm text-foreground">
                  {assignment.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssignmentOverview;
