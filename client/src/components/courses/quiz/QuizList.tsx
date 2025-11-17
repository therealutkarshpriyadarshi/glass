import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchQuizzesByCourse } from "@/store/quiz/slice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Users, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface Quiz {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  questionsCount?: number;
  creatorId: number;
}

const QuizList: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { list: quizzes, loading } = useAppSelector((state) => state.quizzes);
  const currentUserId = useAppSelector((state) => state.auth.user?.id);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchQuizzesByCourse(parseInt(courseId)));
    }
  }, [courseId, dispatch]);

  const getQuizStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      return { status: "upcoming", label: "Upcoming", variant: "secondary" as const };
    } else if (now >= start && now <= end) {
      return { status: "active", label: "Active", variant: "default" as const };
    } else {
      return { status: "completed", label: "Completed", variant: "outline" as const };
    }
  };

  const handleQuizClick = (quizId: number, isCreator: boolean) => {
    if (isCreator) {
      navigate(`/courses/${courseId}/quizzes/${quizId}/analytics`);
    } else {
      navigate(`/courses/${courseId}/quizzes/${quizId}`);
    }
  };

  const handleTakeQuiz = (quizId: number) => {
    navigate(`/courses/${courseId}/quizzes/${quizId}/take`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!quizzes || quizzes.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">No quizzes available for this course yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz: Quiz, index: number) => {
        const { status, label, variant } = getQuizStatus(quiz.startTime, quiz.endTime);
        const isCreator = quiz.creatorId === currentUserId;

        return (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
              onClick={() => handleQuizClick(quiz.id, isCreator)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{quiz.title}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {quiz.description}
                    </p>
                  </div>
                  <Badge variant={variant}>{label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(quiz.startTime).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{quiz.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{quiz.questionsCount || 0} questions</span>
                  </div>
                </div>

                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  {isCreator ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/courses/${courseId}/quizzes/${quiz.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate(`/courses/${courseId}/quizzes/${quiz.id}/analytics`)}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Analytics
                      </Button>
                    </>
                  ) : (
                    <>
                      {status === "active" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleTakeQuiz(quiz.id)}
                        >
                          Take Quiz
                        </Button>
                      )}
                      {status === "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/courses/${courseId}/quizzes/${quiz.id}/results`)}
                        >
                          View Results
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default QuizList;
