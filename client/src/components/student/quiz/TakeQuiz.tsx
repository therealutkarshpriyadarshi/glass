import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchQuizById } from "@/store/quiz/slice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";

interface Answer {
  questionId: number;
  selectedOptions: number[];
}

const TakeQuiz: React.FC = () => {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { currentQuiz: quiz, loading } = useAppSelector((state) => state.quizzes);

  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, number[]>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Fetch quiz and start attempt
  useEffect(() => {
    const startQuizAttempt = async () => {
      if (!quizId) return;

      try {
        // Fetch quiz details (without correct answers)
        await dispatch(fetchQuizById(parseInt(quizId))).unwrap();

        // Start quiz attempt
        const response = await axios.post(`/quizzes/${quizId}/attempts`);
        const submission = response.data.submission;
        setSubmissionId(submission.id);
        setStartTime(new Date(submission.startTime));

        // Set timer based on quiz duration
        if (quiz?.duration) {
          setTimeRemaining(quiz.duration * 60); // Convert minutes to seconds
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to start quiz attempt",
          variant: "destructive",
        });
        navigate(`/courses/${courseId}/quizzes/${quizId}`);
      }
    };

    startQuizAttempt();
  }, [quizId, dispatch]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmit(true); // Auto-submit when time runs out
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!submissionId || answers.size === 0) return;

    const autoSave = setInterval(() => {
      saveProgress();
    }, 30000);

    return () => clearInterval(autoSave);
  }, [submissionId, answers]);

  const saveProgress = async () => {
    if (!submissionId) return;

    try {
      const answersArray = Array.from(answers.entries()).map(([questionId, selectedOptions]) => ({
        questionId,
        selectedOptions,
      }));

      await axios.put(`/quizzes/attempts/${submissionId}/progress`, {
        answers: answersArray,
      });
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const answersArray = Array.from(answers.entries()).map(([questionId, selectedOptions]) => ({
        questionId,
        selectedOptions,
      }));

      const response = await axios.post(`/quizzes/attempts/${submissionId}/submit`, {
        answers: answersArray,
      });

      toast({
        title: "Success",
        description: autoSubmit
          ? "Quiz automatically submitted due to time limit"
          : "Quiz submitted successfully",
      });

      // Navigate to results page
      navigate(`/courses/${courseId}/quizzes/${quizId}/results?submissionId=${submissionId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit quiz",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleAnswerChange = (questionId: number, optionId: number, isMulti: boolean) => {
    setAnswers((prev) => {
      const newAnswers = new Map(prev);
      const currentAnswers = newAnswers.get(questionId) || [];

      if (isMulti) {
        // Multi-select: toggle option
        if (currentAnswers.includes(optionId)) {
          newAnswers.set(
            questionId,
            currentAnswers.filter((id) => id !== optionId)
          );
        } else {
          newAnswers.set(questionId, [...currentAnswers, optionId]);
        }
      } else {
        // Single-select: replace answer
        newAnswers.set(questionId, [optionId]);
      }

      return newAnswers;
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getProgress = () => {
    if (!quiz?.questions) return 0;
    return (answers.size / quiz.questions.length) * 100;
  };

  if (loading || !quiz) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentQuestion = quiz.questions?.[currentQuestionIndex];
  const isMultiCorrect = currentQuestion?.type === 1;
  const currentAnswers = answers.get(currentQuestion?.id || 0) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with timer and progress */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{quiz.title}</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className={`h-5 w-5 ${timeRemaining < 300 ? "text-destructive" : ""}`} />
                <span className={`font-mono text-lg ${timeRemaining < 300 ? "text-destructive" : ""}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress: {answers.size} of {quiz.questions?.length || 0} answered</span>
              <span>{Math.round(getProgress())}%</span>
            </div>
            <Progress value={getProgress()} />
          </div>
        </CardHeader>
      </Card>

      {/* Question Card */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-muted-foreground mb-2">
                  Question {currentQuestionIndex + 1} of {quiz.questions?.length || 0}
                </div>
                <CardTitle className="text-xl">{currentQuestion.title}</CardTitle>
                {currentQuestion.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {currentQuestion.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{currentQuestion.points} points</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {isMultiCorrect ? "Multiple answers" : "Single answer"}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isMultiCorrect ? (
              <div className="space-y-3">
                {currentQuestion.options?.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`option-${option.id}`}
                      checked={currentAnswers.includes(option.id)}
                      onCheckedChange={() =>
                        handleAnswerChange(currentQuestion.id, option.id, true)
                      }
                    />
                    <Label
                      htmlFor={`option-${option.id}`}
                      className="cursor-pointer flex-1 py-3 px-4 rounded-md border hover:bg-accent"
                    >
                      {option.text}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <RadioGroup
                value={currentAnswers[0]?.toString()}
                onValueChange={(value) =>
                  handleAnswerChange(currentQuestion.id, parseInt(value), false)
                }
              >
                <div className="space-y-3">
                  {currentQuestion.options?.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                      <Label
                        htmlFor={`option-${option.id}`}
                        className="cursor-pointer flex-1 py-3 px-4 rounded-md border hover:bg-accent"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              {currentQuestionIndex < (quiz.questions?.length || 0) - 1 ? (
                <Button onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}>
                  Next
                </Button>
              ) : (
                <Button onClick={() => handleSubmit(false)} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Quiz"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Navigator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 md:grid-cols-12 gap-2">
            {quiz.questions?.map((question, index) => {
              const isAnswered = answers.has(question.id);
              const isCurrent = index === currentQuestionIndex;

              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`
                    aspect-square rounded-md border-2 text-sm font-medium transition-colors
                    ${isCurrent ? "border-primary bg-primary text-primary-foreground" : ""}
                    ${isAnswered && !isCurrent ? "border-green-500 bg-green-50" : ""}
                    ${!isAnswered && !isCurrent ? "border-muted hover:border-primary" : ""}
                  `}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Warning message */}
      {timeRemaining < 300 && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-2 p-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">
              Less than 5 minutes remaining! The quiz will auto-submit when time runs out.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TakeQuiz;
