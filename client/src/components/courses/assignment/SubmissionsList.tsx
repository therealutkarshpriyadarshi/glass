import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAssignmentById } from "@/store/assignments/api";
import { fetchSubmissionsByAssignment } from "@/store/submissions/api";
import { createGrade, updateGrade } from "@/store/grades/api";
import {
  ArrowLeft,
  User,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SubmissionsList: React.FC = () => {
  const { courseId, assignmentId } = useParams<{
    courseId: string;
    assignmentId: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { currentAssignment: assignment, loading: assignmentLoading } =
    useAppSelector((state) => state.assignments);
  const { submissions, loading: submissionsLoading } = useAppSelector(
    (state) => state.submissions
  );
  const { loading: gradeLoading } = useAppSelector((state) => state.grades);

  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(
    null
  );
  const [gradePoints, setGradePoints] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");

  useEffect(() => {
    if (assignmentId) {
      dispatch(fetchAssignmentById(parseInt(assignmentId)));
      dispatch(fetchSubmissionsByAssignment(parseInt(assignmentId)));
    }
  }, [assignmentId, dispatch]);

  const handleGradeSubmit = async (submissionId: number, existingGrade?: any) => {
    const points = parseFloat(gradePoints);

    if (isNaN(points)) {
      alert("Please enter a valid grade");
      return;
    }

    try {
      if (existingGrade) {
        await dispatch(
          updateGrade({
            gradeId: existingGrade.id,
            pointsEarned: points,
            feedback: gradeFeedback,
          })
        ).unwrap();
      } else {
        await dispatch(
          createGrade({
            submissionId,
            pointsEarned: points,
            feedback: gradeFeedback,
          })
        ).unwrap();
      }

      setSelectedSubmission(null);
      setGradePoints("");
      setGradeFeedback("");

      // Refresh submissions
      if (assignmentId) {
        dispatch(fetchSubmissionsByAssignment(parseInt(assignmentId)));
      }
    } catch (error) {
      console.error("Failed to submit grade:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (submission: any) => {
    if (submission.grade) {
      return <Badge variant="default" className="bg-green-600">Graded</Badge>;
    }

    if (submission.status === "late") {
      return <Badge variant="destructive">Late</Badge>;
    }

    if (submission.status === "submitted") {
      return <Badge variant="secondary">Pending</Badge>;
    }

    return <Badge variant="outline">{submission.status}</Badge>;
  };

  if (assignmentLoading || submissionsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-muted-foreground">Loading...</div>
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() =>
            navigate(`/courses/${courseId}/assignments/${assignmentId}`)
          }
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assignment
        </Button>

        <h1 className="text-3xl font-bold mb-2">Submissions: {assignment.title}</h1>
        <p className="text-muted-foreground">
          {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No submissions yet
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">
                        Student ID: {submission.userId}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Submitted: {formatDate(submission.submittedAt)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(submission)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Files */}
                  {submission.files && submission.files.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold">
                        Submitted Files ({submission.files.length})
                      </Label>
                      <div className="mt-2 space-y-2">
                        {submission.files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm p-2 bg-muted rounded"
                          >
                            <FileText className="h-4 w-4" />
                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {file.userFileName}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grade Display or Form */}
                  {submission.grade ? (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-semibold">Grade</Label>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSubmission(submission.id);
                                setGradePoints(submission.grade.pointsEarned.toString());
                                setGradeFeedback(submission.grade.feedback || "");
                              }}
                            >
                              Edit Grade
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Grade</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label htmlFor="points">Points</Label>
                                <Input
                                  id="points"
                                  type="number"
                                  step="0.1"
                                  value={gradePoints}
                                  onChange={(e) => setGradePoints(e.target.value)}
                                  placeholder="Enter points"
                                />
                              </div>
                              <div>
                                <Label htmlFor="feedback">Feedback</Label>
                                <Textarea
                                  id="feedback"
                                  value={gradeFeedback}
                                  onChange={(e) => setGradeFeedback(e.target.value)}
                                  placeholder="Enter feedback (optional)"
                                  rows={4}
                                />
                              </div>
                              <Button
                                onClick={() => handleGradeSubmit(submission.id, submission.grade)}
                                disabled={gradeLoading}
                                className="w-full"
                              >
                                {gradeLoading ? "Updating..." : "Update Grade"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="bg-muted p-4 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold text-primary">
                            {submission.grade.pointsEarned} points
                          </span>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        {submission.grade.feedback && (
                          <div>
                            <Label className="text-xs">Feedback:</Label>
                            <p className="text-sm mt-1">{submission.grade.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="border-t pt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="default"
                            onClick={() => {
                              setSelectedSubmission(submission.id);
                              setGradePoints("");
                              setGradeFeedback("");
                            }}
                          >
                            Grade Submission
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Grade Submission</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label htmlFor="points">Points</Label>
                              <Input
                                id="points"
                                type="number"
                                step="0.1"
                                value={gradePoints}
                                onChange={(e) => setGradePoints(e.target.value)}
                                placeholder="Enter points"
                              />
                            </div>
                            <div>
                              <Label htmlFor="feedback">Feedback</Label>
                              <Textarea
                                id="feedback"
                                value={gradeFeedback}
                                onChange={(e) => setGradeFeedback(e.target.value)}
                                placeholder="Enter feedback (optional)"
                                rows={4}
                              />
                            </div>
                            <Button
                              onClick={() => handleGradeSubmit(submission.id)}
                              disabled={gradeLoading}
                              className="w-full"
                            >
                              {gradeLoading ? "Submitting..." : "Submit Grade"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionsList;
