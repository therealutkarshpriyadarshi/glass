import React from "react";
import { Typography, Alert } from "antd";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import AuthForm from "./AuthForm";
import FeatureList from "./FeatureList";
import { useAuth } from "../../hooks/auth";

const { Title, Text } = Typography;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Container = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  padding: 2rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

const RightPanel = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 2rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

const ToggleText = styled(Text)`
  margin-top: 1rem;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #1890ff;
  }
`;

const WelcomeText = styled(Title)`
  color: white;
  margin-bottom: 2rem;
`;

/**
 * Auth component for handling user authentication (sign up and sign in).
 *
 * This component renders a two-panel layout with authentication form on the left
 * and welcome message with feature list on the right. It uses custom hooks for
 * authentication logic and Framer Motion for animations.
 *
 * @component
 */
const Auth: React.FC = () => {
  const { isSignUp, isLoading, error, onFinish, toggleAuthMode } = useAuth();

  const formAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Container>
      <LeftPanel>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={formAnimation}
          transition={{ duration: 0.5 }}
        >
          <Title
            level={2}
            style={{ marginBottom: "2rem", textAlign: "center" }}
          >
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </Title>
          <AuthForm
            isSignUp={isSignUp}
            isLoading={isLoading}
            onFinish={onFinish}
          />
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: "1rem" }}
            />
          )}
          <ToggleText onClick={toggleAuthMode}>
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </ToggleText>
        </motion.div>
      </LeftPanel>
      <RightPanel>
        <WelcomeText level={1}>Welcome to ClassConnect</WelcomeText>
        <FeatureList />
      </RightPanel>
    </Container>
  );
};

export default Auth;
