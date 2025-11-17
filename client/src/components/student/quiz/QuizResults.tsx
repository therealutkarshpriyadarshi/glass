import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import axios from "axios";

interface QuizResult {
  id: number;
  quizId: number;
  userId: number;
  startTime: string;
  endTime: string;
  score: number;
  quiz: {
    title: string;
    description: string;
    showResults: boolean;
    questions: Array<{
      id: number;
      title: string;
      description: string;
      type: number;
      points: number;
      options: Array<{
        id: number;
        text: string;
        isCorrect: boolean;
      }>;
    }>;
  };
  answers: Array<{
    questionId: number;
    selectedOptions: number[];
  }>;
}

const QuizResults: React.FC = () => {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const [searchParams] = useSearchParams();
  const submissionId = searchParams.get("submissionId");
  const navigate = useNavigate();

  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!submissionId) return;

      try {
        const response = await axios.get(`/quizzes/attempts/${submissionId}/results`);
        setResult(response.data.results);
      } catch (error) {
        console.error("Failed to fetch results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [submissionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Results not found</p>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: "Excellent", variant: "default" as const };
    if (score >= 70) return { label: "Good", variant: "secondary" as const };
    if (score >= 50) return { label: "Pass", variant: "outline" as const };
    return { label: "Needs Improvement", variant: "destructive" as const };
  };

  const getTimeTaken = () => {
    const start = new Date(result.startTime);
    const end = new Date(result.endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    return `${diffMins}m ${diffSecs}s`;
  };

  const getAnswerStatus = (questionId: number) => {
    const question = result.quiz.questions.find((q) => q.id === questionId);
    const answer = result.answers.find((a) => a.questionId === questionId);

    if (!question || !answer) return { isCorrect: false, correctOptions: [] };

    const correctOptionIds = question.options
      .filter((opt) => opt.isCorrect)
      .map((opt) => opt.id);

    const isCorrect =
      correctOptionIds.length === answer.selectedOptions.length &&
      correctOptionIds.every((id) => answer.selectedOptions.includes(id));

    return { isCorrect, correctOptions: correctOptionIds };
  };

  const { label, variant } = getScoreBadge(result.score);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(`/courses/${courseId}/quizzes/${quizId}`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Quiz
      </Button>

      {/* Score Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{result.quiz.title}</CardTitle>
              <Badge variant={variant}>{label}</Badge>
            </div>
            <div className="text-right">
              <div className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                {result.score.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground mt-2">Your Score</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Time Taken</p>
                <p className="text-sm text-muted-foreground">{getTimeTaken()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Submitted</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(result.endTime).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Questions</p>
                <p className="text-sm text-muted-foreground">
                  {result.answers.length} of {result.quiz.questions.length} answered
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      {result.quiz.showResults && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.quiz.questions.map((question, index) => {
              const answer = result.answers.find((a) => a.questionId === question.id);
              const { isCorrect, correctOptions } = getAnswerStatus(question.id);

              return (
                <div key={question.id} className="space-y-3">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">
                          Question {index + 1}: {question.title}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {question.points} points
                        </span>
                      </div>
                      {question.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {question.description}
                        </p>
                      )}

                      <div className="space-y-2">
                        {question.options.map((option) => {
                          const isSelected = answer?.selectedOptions.includes(option.id);
                          const isCorrectOption = option.isCorrect;

                          let optionClass = "border-2 p-3 rounded-md ";
                          if (isSelected && isCorrectOption) {
                            optionClass += "bg-green-50 border-green-500";
                          } else if (isSelected && !isCorrectOption) {
                            optionClass += "bg-red-50 border-red-500";
                          } else if (!isSelected && isCorrectOption) {
                            optionClass += "bg-green-50 border-green-300";
                          } else {
                            optionClass += "border-muted";
                          }

                          return (
                            <div key={option.id} className={optionClass}>
                              <div className="flex items-center justify-between">
                                <span>{option.text}</span>
                                <div className="flex gap-2">
                                  {isSelected && (
                                    <Badge variant="outline" className="text-xs">
                                      Your Answer
                                    </Badge>
                                  )}
                                  {isCorrectOption && (
                                    <Badge variant="default" className="text-xs bg-green-600">
                                      Correct
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  {index < result.quiz.questions.length - 1 && <Separator />}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {!result.quiz.showResults && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              Detailed results are not available for this quiz.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuizResults;
