import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, GraduationCap } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import AuthForm from "./AuthForm";
import FeatureList from "./FeatureList";
import { useAuth } from "../../hooks/auth";
import { useAppSelector } from "@/store/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Left Panel - Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={formAnimation}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">ClassConnect</h1>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                {isSignUp ? "Create an account" : "Welcome back"}
              </CardTitle>
              <CardDescription className="text-center">
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
                <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Separator className="mb-4" />
            <p className="text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={toggleAuthMode}
                className="text-primary font-medium hover:underline focus:outline-none"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Feature Showcase */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center bg-primary/5 p-12 border-l">
        <div className="max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Transform Your Learning Experience
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
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
