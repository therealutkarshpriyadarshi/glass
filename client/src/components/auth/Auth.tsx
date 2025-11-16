import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, GraduationCap } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import AuthForm from "./AuthForm";
import FeatureList from "./FeatureList";
import { useAuth } from "../../hooks/auth";
import { useAppSelector } from "@/store/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="flex min-h-screen bg-black">
      {/* Left Panel - Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={formAnimation}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">ClassConnect</h1>
            </div>
          </div>

          <Card className="bg-black border-white/10">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-xl text-center text-white font-medium">
                {isSignUp ? "Create an account" : "Welcome back"}
              </CardTitle>
              <CardDescription className="text-center text-white/40">
                {isSignUp
                  ? "Enter your details to get started"
                  : "Enter your credentials to sign in"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthForm
                isSignUp={isSignUp}
                isLoading={isLoading}
                onFinish={onFinish}
              />
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2"
                >
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-500/90">{error}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/40">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={toggleAuthMode}
                className="text-white/60 hover:text-white font-medium focus:outline-none transition-colors"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Feature Showcase */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center bg-white/[0.02] p-12 border-l border-white/10">
        <div className="max-w-lg">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h2 className="text-3xl font-semibold text-white mb-3">
              Transform Your Learning Experience
            </h2>
            <p className="text-base text-white/40 mb-8">
              Join thousands of students and educators using ClassConnect to enhance their educational journey.
            </p>
            <FeatureList />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
