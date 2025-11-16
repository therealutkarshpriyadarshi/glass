import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAssignmentById, publishAssignment, unpublishAssignment } from "@/store/assignments/api";
import {
  Calendar,
  FileText,
  Users,
  ArrowLeft,
  Upload,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const AssignmentDetail: React.FC = () => {
  const { courseId, assignmentId } = useParams<{
    courseId: string;
    assignmentId: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentAssignment: assignment, loading } = useAppSelector(
    (state) => state.assignments
  );
  const userRole = useAppSelector((state) => state.auth.user?.role); // Assuming auth has user role

  useEffect(() => {
    if (assignmentId) {
      dispatch(fetchAssignmentById(parseInt(assignmentId)));
    }
  }, [assignmentId, dispatch]);

  const handlePublishToggle = async () => {
    if (!assignment) return;

    if (assignment.isPublished) {
      await dispatch(unpublishAssignment(assignment.id));
    } else {
      await dispatch(publishAssignment(assignment.id));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isTeacher = userRole === "teacher" || userRole === "admin";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-muted-foreground">Loading assignment...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-lg text-muted-foreground">Assignment not found</div>
        <Button onClick={() => navigate(`/courses/${courseId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>
      </div>
    );
  }

  const getDueStatus = () => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);

    if (dueDate < now) {
      return { text: "Overdue", variant: "destructive" as const };
    }

    const threeDays = 3 * 24 * 60 * 60 * 1000;
    if (dueDate.getTime() - now.getTime() < threeDays) {
      return { text: "Due Soon", variant: "default" as const };
    }

    return { text: "Active", variant: "default" as const };
  };

  const dueStatus = getDueStatus();

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/courses/${courseId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{assignment.title}</h1>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Due: {formatDate(assignment.dueDate)}</span>
              </div>
              {assignment.isPublished && (
                <Badge variant={dueStatus.variant}>{dueStatus.text}</Badge>
              )}
              {!assignment.isPublished && (
                <Badge variant="secondary">Draft</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Controls */}
      {isTeacher && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Teacher Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="publish-switch" className="cursor-pointer">
                {assignment.isPublished ? "Published" : "Draft"}
              </Label>
              <Switch
                id="publish-switch"
                checked={assignment.isPublished}
                onCheckedChange={handlePublishToggle}
              />
            </div>
            <Button
              className="w-full"
              onClick={() =>
                navigate(
                  `/courses/${courseId}/assignments/${assignmentId}/submissions`
                )
              }
            >
              <Users className="mr-2 h-4 w-4" />
              View Submissions
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Assignment Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: assignment.instructions || "No instructions provided" }}
          />
        </CardContent>
      </Card>

      {/* Student Actions */}
      {!isTeacher && assignment.isPublished && (
        <Card>
          <CardHeader>
            <CardTitle>Your Submission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={() =>
                navigate(
                  `/courses/${courseId}/assignments/${assignmentId}/submit`
                )
              }
            >
              <Upload className="mr-2 h-4 w-4" />
              Submit Assignment
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Unpublished Message for Students */}
      {!isTeacher && !assignment.isPublished && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            This assignment has not been published yet
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssignmentDetail;
