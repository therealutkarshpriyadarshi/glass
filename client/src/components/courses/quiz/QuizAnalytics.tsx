import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Award,
  Clock,
  Download,
} from "lucide-react";
import axios from "axios";

interface QuizAnalytics {
  quizId: number;
  quizTitle: string;
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  submissions: Array<{
    id: number;
    userId: number;
    startTime: string;
    endTime: string;
    score: number;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

const QuizAnalytics: React.FC = () => {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!quizId) return;

      try {
        const response = await axios.get(`/quizzes/${quizId}/analytics`);
        setAnalytics(response.data.analytics);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [quizId]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getTimeTaken = (startTime: string, endTime: string) => {
    if (!endTime) return "In Progress";
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return `${diffMins} min`;
  };

  const exportToCSV = () => {
    if (!analytics) return;

    const headers = ["Student Name", "Email", "Score (%)", "Time Taken", "Submitted At"];
    const rows = analytics.submissions
      .filter((sub) => sub.endTime) // Only completed submissions
      .map((sub) => [
        `${sub.user.firstName} ${sub.user.lastName}`,
        sub.user.email,
        sub.score.toFixed(2),
        getTimeTaken(sub.startTime, sub.endTime),
        new Date(sub.endTime).toLocaleString(),
      ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `quiz_${quizId}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Analytics not found</p>
        </CardContent>
      </Card>
    );
  }

  const completionRate =
    analytics.totalAttempts > 0
      ? (analytics.completedAttempts / analytics.totalAttempts) * 100
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => navigate(`/courses/${courseId}/quizzes/${quizId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quiz
        </Button>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{analytics.quizTitle} - Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Attempts</p>
                    <p className="text-2xl font-bold">{analytics.totalAttempts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{analytics.completedAttempts}</p>
                    <Badge variant="outline" className="mt-1">
                      {completionRate.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className={`text-2xl font-bold ${getScoreColor(analytics.averageScore)}`}>
                      {analytics.averageScore.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Highest Score</p>
                    <p className={`text-2xl font-bold ${getScoreColor(analytics.highestScore)}`}>
                      {analytics.highestScore.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.submissions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No submissions yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Time Taken</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">
                      {submission.user.firstName} {submission.user.lastName}
                    </TableCell>
                    <TableCell>{submission.user.email}</TableCell>
                    <TableCell>
                      {submission.endTime ? (
                        <span className={`font-semibold ${getScoreColor(submission.score)}`}>
                          {submission.score.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getTimeTaken(submission.startTime, submission.endTime)}
                    </TableCell>
                    <TableCell>
                      {submission.endTime
                        ? new Date(submission.endTime).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {submission.endTime ? (
                        <Badge
                          variant={submission.score >= 50 ? "default" : "destructive"}
                        >
                          {submission.score >= 50 ? "Pass" : "Fail"}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">In Progress</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Score Distribution */}
      {analytics.completedAttempts > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { range: "90-100%", min: 90, max: 100, color: "bg-green-500" },
                { range: "70-89%", min: 70, max: 89, color: "bg-blue-500" },
                { range: "50-69%", min: 50, max: 69, color: "bg-yellow-500" },
                { range: "0-49%", min: 0, max: 49, color: "bg-red-500" },
              ].map((bucket) => {
                const count = analytics.submissions.filter(
                  (sub) =>
                    sub.endTime &&
                    sub.score >= bucket.min &&
                    sub.score <= bucket.max
                ).length;
                const percentage =
                  analytics.completedAttempts > 0
                    ? (count / analytics.completedAttempts) * 100
                    : 0;

                return (
                  <div key={bucket.range}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{bucket.range}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} students ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`${bucket.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuizAnalytics;
