import React from "react";
import { Form, Input, Button } from "antd";
import { LockOutlined, MailOutlined, IdcardOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";

const StyledForm = styled(Form)`
  width: 100%;
  max-width: 400px;

  .ant-form-item {
    margin-bottom: 1.5rem;
  }

  .ant-input-affix-wrapper {
    border-radius: 50px;
    padding: 12px 15px;
  }

  .ant-input-affix-wrapper > input.ant-input {
    background: transparent;
  }

  .ant-form-item-explain-error {
    padding-left: 15px;
  }
`;

const StyledButton = styled(Button)`
  width: 100%;
  height: 50px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

interface AuthFormProps {
  isSignUp: boolean;
  isLoading: boolean;
  onFinish: (values: unknown) => void;
}

/**
 * AuthForm component for handling user authentication (sign up and sign in).
 *
 * This component renders a form with fields for email and password,
 * and additional fields for first name, last name, and password confirmation when in sign up mode.
 * It uses Ant Design components for form elements and Framer Motion for animations.
 *
 * @component
 * @param {Object} props - The component props
 * @param {boolean} props.isSignUp - Determines whether the form is in sign up or sign in mode
 * @param {boolean} props.isLoading - Indicates if the form submission is in progress
 * @param {function} props.onFinish - Callback function to be called when the form is submitted
 */
const AuthForm: React.FC<AuthFormProps> = ({
  isSignUp,
  isLoading,
  onFinish,
}) => {
  const [form] = Form.useForm();

  return (
    <StyledForm
      form={form}
      name="auth_form"
      onFinish={onFinish}
      layout="vertical"
    >
      <AnimatePresence>
        {isSignUp && (
          <motion.div
            key="name-fields"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Form.Item
              name="firstName"
              rules={[
                { required: true, message: "Please input your first name!" },
              ]}
            >
              <Input prefix={<IdcardOutlined />} placeholder="First Name" />
            </Form.Item>
            <Form.Item
              name="lastName"
              rules={[
                { required: true, message: "Please input your last name!" },
              ]}
            >
              <Input prefix={<IdcardOutlined />} placeholder="Last Name" />
            </Form.Item>
          </motion.div>
        )}
      </AnimatePresence>
      <Form.Item
        name="email"
        rules={[
          { required: true, message: "Please input your email!" },
          { type: "email", message: "Please enter a valid email address!" },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="Email" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          { required: true, message: "Please input your password!" },
          { min: 6, message: "Password must be at least 6 characters long!" },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
      </Form.Item>
      <AnimatePresence>
        {isSignUp && (
          <motion.div
            key="confirm-password"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The two passwords do not match!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm Password"
              />
            </Form.Item>
          </motion.div>
        )}
      </AnimatePresence>
      <Form.Item>
        <StyledButton type="primary" htmlType="submit" loading={isLoading}>
          {isSignUp ? "Sign Up" : "Sign In"}
        </StyledButton>
      </Form.Item>
    </StyledForm>
  );
};

export default AuthForm;
