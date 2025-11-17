import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FileText, Calendar, Clock } from "lucide-react";
import type { Assignment } from "../../../store/assignments/type";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface AssignmentOverviewProps {
  assignments: Assignment[];
}

/**
 * AssignmentOverview component displays a list of assignments.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Assignment[]} props.assignments - An array of assignment objects to be displayed.
 * @returns {React.FC} A list of assignments.
 */
const AssignmentOverview: React.FC<AssignmentOverviewProps> = ({
  assignments,
}) => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();

  const handleAssignmentClick = (assignmentId: number) => {
    navigate(`/courses/${courseId}/assignments/${assignmentId}`);
  };

  const getStatusBadge = (assignment: Assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);

    if (!assignment.isPublished) {
      return <Badge variant="secondary">Draft</Badge>;
    }

    if (dueDate < now) {
      return <Badge variant="destructive">Overdue</Badge>;
    }

    const threeDays = 3 * 24 * 60 * 60 * 1000;
    if (dueDate.getTime() - now.getTime() < threeDays) {
      return <Badge variant="default" className="bg-warning">Due Soon</Badge>;
    }

    return <Badge variant="default">Active</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-0">
      {assignments.map((assignment) => (
        <div
          key={assignment.id}
          onClick={() => handleAssignmentClick(assignment.id)}
          className="p-4 border-b border-border transition-colors hover:bg-accent/50 cursor-pointer"
        >
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10 flex items-center justify-center bg-primary">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-foreground">
                  {assignment.title}
                </h4>
                {getStatusBadge(assignment)}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Due: {formatDate(assignment.dueDate)}
                </p>
                {assignment.description && (
                  <p className="text-sm text-foreground line-clamp-2">
                    {assignment.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssignmentOverview;
