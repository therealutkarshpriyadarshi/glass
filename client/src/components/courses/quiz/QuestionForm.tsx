import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Button,
  Space,
  Typography,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

const { Option } = Select;
const { Title } = Typography;

const StyledForm = styled(Form)`
  .ant-form-item {
    margin-bottom: 24px;
  }
`;

const OptionContainer = styled(motion.div)`
  background-color: #f0f2f5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

interface QuestionFormProps {
  questionData?: any;
  onSave: (questionData: any) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  questionData,
  onSave,
  onDelete,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [questionType, setQuestionType] = useState(
    questionData?.type || "single_correct"
  );

  useEffect(() => {
    if (questionData) {
      form.setFieldsValue(questionData);
      setQuestionType(questionData.type);
    }
  }, [questionData, form]);

  const onFinish = (values: any) => {
    onSave({ ...questionData, ...values });
  };

  const handleTypeChange = (value: string) => {
    setQuestionType(value);
  };

  return (
    <StyledForm
      form={form}
      onFinish={onFinish}
      layout="vertical"
      initialValues={{ type: "single_correct" }}
    >
      <Title level={4}>
        {questionData ? "Edit Question" : "Add New Question"}
      </Title>
      <Form.Item name="title" label="Question" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="type" label="Question Type" rules={[{ required: true }]}>
        <Select onChange={handleTypeChange}>
          <Option value="single_correct">Single Correct Answer</Option>
          <Option value="multi_correct">Multiple Correct Answers</Option>
        </Select>
      </Form.Item>
      <Form.Item name="points" label="Points" rules={[{ required: true }]}>
        <InputNumber min={1} />
      </Form.Item>

      <Form.List name="options">
        {(fields, { add, remove }) => (
          <>
            <AnimatePresence>
              {fields.map((field, index) => (
                <OptionContainer
                  key={field.key}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Space
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...field}
                      name={[field.name, "text"]}
                      rules={[
                        { required: true, message: "Missing option text" },
                      ]}
                    >
                      <Input placeholder="Option text" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, "isCorrect"]}
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="Correct"
                        unCheckedChildren="Incorrect"
                        disabled={
                          questionType === "single_correct" && index !== 0
                        }
                      />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                </OptionContainer>
              ))}
            </AnimatePresence>
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                Add Option
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Save Question
          </Button>
          {onDelete && (
            <Button danger onClick={onDelete}>
              Delete Question
            </Button>
          )}
          <Button onClick={onCancel}>Cancel</Button>
        </Space>
      </Form.Item>
    </StyledForm>
  );
};

export default QuestionForm;
