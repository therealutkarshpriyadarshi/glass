import { Form } from "antd";
import { useEffect, useState } from "react";
import moment from "moment";
import type { Question } from "../store/quiz/type";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchQuizById,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  createQuiz,
  updateQuiz,
} from "../store/quiz/slice";

interface QuizFormData {
  title: string;
  description: string;
  timeRange: [moment.Moment, moment.Moment];
  duration: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  questions: Question[];
}

export const useQuizForm = (quizId?: number) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { currentQuiz, isLoading } = useAppSelector((state) => state.quizzes);
  const [initialValues, setInitialValues] = useState<QuizFormData | null>(null);

  useEffect(() => {
    if (quizId) {
      dispatch(fetchQuizById(quizId));
    }
  }, [dispatch, quizId]);

  useEffect(() => {
    if (currentQuiz) {
      const values: QuizFormData = {
        title: currentQuiz.title,
        description: currentQuiz.description,
        timeRange: [moment(currentQuiz.startTime), moment(currentQuiz.endTime)],
        duration: currentQuiz.duration,
        shuffleQuestions: currentQuiz.shuffleQuestions,
        showResults: currentQuiz.showResults,
        questions: currentQuiz.questions,
      };
      setInitialValues(values);
      form.setFieldsValue(values);
    }
  }, [currentQuiz, form]);

  const handleSave = async (values: QuizFormData) => {
    const [startTime, endTime] = values.timeRange;
    const quizData = {
      ...values,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      courseId: currentQuiz?.courseId ?? 0,
    };
    delete (quizData as any).timeRange;

    try {
      if (quizId) {
        await dispatch(updateQuiz({ ...quizData, id: quizId }));
      } else {
        await dispatch(createQuiz(quizData));
      }
    } catch (error) {
      console.error("Failed to save quiz", error);
      throw error;
    }
  };

  const handleAddQuestion = async (question: Omit<Question, "id">) => {
    if (!quizId) {
      throw new Error("Quiz must be saved before adding questions");
    }
    try {
      await dispatch(addQuestion({ quizId, question }));
    } catch (error) {
      console.error("Failed to add question", error);
      throw error;
    }
  };

  const handleUpdateQuestion = async (question: Question) => {
    try {
      await dispatch(updateQuestion(question));
    } catch (error) {
      console.error("Failed to update question", error);
      throw error;
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      await dispatch(deleteQuestion(questionId));
    } catch (error) {
      console.error("Failed to delete question", error);
      throw error;
    }
  };

  return {
    form,
    initialValues,
    isLoading,
    handleSave,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
  };
};
