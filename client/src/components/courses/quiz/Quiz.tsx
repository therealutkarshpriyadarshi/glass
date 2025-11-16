import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  InputNumber,
  Switch,
  message,
  Typography,
  Card,
  Tabs,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import type { Question } from "../../../store/quiz/type";

interface QuizFormData {
  title: string;
  description: string;
  timeRange: [moment.Moment, moment.Moment];
  duration: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  questions: Question[];
}
const { Title } = Typography;
const { RangePicker } = DatePicker;

const Quiz: React.FC = () => {
  const [localQuiz, setLocalQuiz] = useState<QuizFormData>({ questions: [] });
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

  const handleAddQuestion = (questionData: any) => {
    setLocalQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, { ...questionData, id: Date.now() }],
    }));
    message.success("Question added successfully");
  };

  const handleUpdateQuestion = (questionData: any) => {
    setLocalQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionData.id ? questionData : q
      ),
    }));
    message.success("Question updated successfully");
  };

  const handleDeleteQuestion = (questionId: number) => {
    setLocalQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }));
    message.success("Question deleted successfully");
  };

  const handleSave = async (values: any) => {
    const newQuizData = { ...values, questions: localQuiz.questions };
    // Dispatch action to create new quiz with newQuizData
    console.log("Saving new quiz:", newQuizData);
    // Replace with actual API call or dispatch
    message.success("Quiz created successfully");
  };

  return (
    <div>
      <Title level={2}>Create New Quiz</Title>
      <StyledTabs activeKey="1" onChange={() => {}}>
        <Tabs.TabPane tab="Quiz Details" key="1">
          <StyledCard>
            <Form
              form={form}
              onFinish={handleSave}
              layout="vertical"
              initialValues={initialValues || {}}
            >
              <Form.Item
                name="title"
                label="Quiz Title"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item
                name="timeRange"
                label="Quiz Time Range"
                rules={[{ required: true }]}
              >
                <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />
              </Form.Item>
              <Form.Item
                name="duration"
                label="Duration (minutes)"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} />
              </Form.Item>
              <Form.Item
                name="shuffleQuestions"
                label="Shuffle Questions"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="showResults"
                label="Show Results Immediately"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={isLoading}>
                  {quizId ? "Update Quiz" : "Create Quiz"}
                </Button>
              </Form.Item>
            </Form>
          </StyledCard>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Questions" key="2">
          <StyledCard>
            <QuestionList layout>
              <AnimatePresence>
                {localQuiz.questions.map((question, index) => (
                  <QuestionCard
                    key={question.id}
                    layoutId={`question-${question.id}`}
                    onClick={() => setSelectedQuestion(index)}
                  >
                    <Typography.Text strong>{question.title}</Typography.Text>
                  </QuestionCard>
                ))}
              </AnimatePresence>
            </QuestionList>
            <Button
              type="dashed"
              onClick={() =>
                setSelectedQuestion(localQuiz.questions.length ?? 0)
              }
              icon={<PlusOutlined />}
              style={{ marginTop: "16px" }}
            >
              Add Question
            </Button>
          </StyledCard>
        </Tabs.TabPane>
      </StyledTabs>
      <AnimatePresence>
        {selectedQuestion !== null && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <StyledCard>
              <QuestionForm
                questionData={localQuiz.questions[selectedQuestion]}
                onSave={(questionData) =>
                  questionData.id
                    ? handleUpdateQuestion(questionData)
                    : handleAddQuestion(questionData)
                }
                onDelete={
                  localQuiz.questions[selectedQuestion]?.id
                    ? () =>
                        handleDeleteQuestion(
                          localQuiz.questions[selectedQuestion].id
                        )
                    : undefined
                }
                onCancel={() => setSelectedQuestion(null)}
              />
            </StyledCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StyledCard = styled(Card)`
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav::before {
    border-bottom: none;
  }
`;

const QuestionList = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 24px;
`;

const QuestionCard = styled(motion.div)`
  background-color: #f0f2f5;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-4px);
  }
`;

export default Quiz;
