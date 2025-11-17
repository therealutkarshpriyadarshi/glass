import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchQuizById } from "@/store/quiz/slice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Calendar,
  User,
  FileText,
  Play,
  BarChart3,
  Edit,
  ArrowLeft,
} from "lucide-react";

const QuizDetail: React.FC = () => {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentQuiz: quiz, loading } = useAppSelector((state) => state.quizzes);
  const currentUserId = useAppSelector((state) => state.auth.user?.id);

  useEffect(() => {
    if (quizId) {
      dispatch(fetchQuizById(parseInt(quizId)));
    }
  }, [quizId, dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Quiz not found</p>
        </CardContent>
      </Card>
    );
  }

  const getQuizStatus = () => {
    const now = new Date();
    const start = new Date(quiz.startTime);
    const end = new Date(quiz.endTime);

    if (now < start) {
      return { status: "upcoming", label: "Upcoming", variant: "secondary" as const };
    } else if (now >= start && now <= end) {
      return { status: "active", label: "Active", variant: "default" as const };
    } else {
      return { status: "completed", label: "Completed", variant: "outline" as const };
    }
  };

  const { status, label, variant } = getQuizStatus();
  const isCreator = quiz.creatorId === currentUserId;

  const handleTakeQuiz = () => {
    navigate(`/courses/${courseId}/quizzes/${quizId}/take`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(`/courses/${courseId}`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Course
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl mb-2">{quiz.title}</CardTitle>
              <Badge variant={variant}>{label}</Badge>
            </div>
            {isCreator && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/courses/${courseId}/quizzes/${quizId}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="default"
                  onClick={() => navigate(`/courses/${courseId}/quizzes/${quizId}/analytics`)}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{quiz.description || "No description provided"}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Start Time</p>
                <p className="text-sm text-muted-foreground">{formatDate(quiz.startTime)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">End Time</p>
                <p className="text-sm text-muted-foreground">{formatDate(quiz.endTime)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">{quiz.duration} minutes</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Questions</p>
                <p className="text-sm text-muted-foreground">
                  {quiz.questions?.length || 0} questions
                </p>
              </div>
            </div>

            {quiz.creator && (
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created By</p>
                  <p className="text-sm text-muted-foreground">
                    {quiz.creator.firstName} {quiz.creator.lastName}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Shuffle Questions:</span>
              <Badge variant={quiz.shuffleQuestions ? "default" : "outline"}>
                {quiz.shuffleQuestions ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Show Results:</span>
              <Badge variant={quiz.showResults ? "default" : "outline"}>
                {quiz.showResults ? "Immediate" : "Hidden"}
              </Badge>
            </div>
          </div>

          {!isCreator && status === "active" && (
            <div className="pt-4">
              <Button size="lg" className="w-full md:w-auto" onClick={handleTakeQuiz}>
                <Play className="h-5 w-5 mr-2" />
                Start Quiz
              </Button>
            </div>
          )}

          {!isCreator && status === "upcoming" && (
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                This quiz will be available from {formatDate(quiz.startTime)}
              </p>
            </div>
          )}

          {!isCreator && status === "completed" && (
            <div className="pt-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/courses/${courseId}/quizzes/${quizId}/results`)}
              >
                View My Results
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizDetail;
