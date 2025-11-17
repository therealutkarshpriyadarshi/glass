import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchGradesByUser } from "@/store/grades/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Award } from "lucide-react";

const GradesList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { grades, loading } = useAppSelector((state) => state.grades);
  const userId = useAppSelector((state) => state.auth.user?.id);

  useEffect(() => {
    if (userId) {
      dispatch(fetchGradesByUser(userId));
    }
  }, [userId, dispatch]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-muted-foreground">Loading grades...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Grades</h1>
        <p className="text-muted-foreground">
          View all your assignment grades and feedback
        </p>
      </div>

      {grades.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No grades yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {grades.map((grade) => (
            <Card key={grade.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Assignment #{grade.submissionId}
                  </CardTitle>
                  <Badge variant="default" className="text-lg px-4 py-1">
                    {grade.pointsEarned} points
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Graded on {formatDate(grade.gradedAt)}
                  </div>

                  {grade.feedback && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-semibold mb-1">Feedback:</p>
                      <p className="text-sm text-foreground bg-muted p-3 rounded">
                        {grade.feedback}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {grades.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Assignments Graded</p>
                <p className="text-2xl font-bold">{grades.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">
                  {(
                    grades.reduce((sum, g) => sum + g.pointsEarned, 0) / grades.length
                  ).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GradesList;
