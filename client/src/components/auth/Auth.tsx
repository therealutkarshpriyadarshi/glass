import React from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import AuthForm from "./AuthForm";
import FeatureList from "./FeatureList";
import { useAuth } from "../../hooks/auth";
import { useAppSelector } from "@/store/hooks";

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
  const { user, token } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Redirect if already authenticated
  const isAuthenticated = !!token && !!user;
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  const formAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel */}
      <div className="flex-1 flex flex-col justify-center items-center bg-background p-8 animate-in fade-in duration-500">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={formAnimation}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </h2>
          <AuthForm
            isSignUp={isSignUp}
            isLoading={isLoading}
            onFinish={onFinish}
          />
          {error && (
            <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <p
            onClick={toggleAuthMode}
            className="mt-4 text-center text-muted-foreground cursor-pointer transition-colors hover:text-primary"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </p>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center items-center bg-card text-card-foreground p-8 animate-in fade-in duration-500">
        <h1 className="text-5xl font-bold mb-8 text-foreground">
          Welcome to ClassConnect
        </h1>
        <FeatureList />
      </div>
    </div>
  );
};

export default Auth;
