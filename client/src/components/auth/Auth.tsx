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
    <div className="flex min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Left Panel - Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={formAnimation}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <motion.div
                className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <GraduationCap className="h-7 w-7 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ClassConnect
              </h1>
            </div>
          </div>

          <Card className="shadow-2xl shadow-purple-500/10 border-muted/50 backdrop-blur-sm bg-card/95">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {isSignUp ? "Create an account" : "Welcome back"}
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground">
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
                  className="mt-4 p-3 rounded-md bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 flex items-start gap-2"
                >
                  <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Separator className="mb-4 bg-gradient-to-r from-transparent via-muted to-transparent" />
            <p className="text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={toggleAuthMode}
                className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-medium hover:from-blue-300 hover:to-purple-300 focus:outline-none transition-all"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Feature Showcase */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center bg-gradient-to-br from-card/50 to-card/30 p-12 border-l border-muted/30 backdrop-blur-sm relative z-10">
        <div className="max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-4">
              Transform Your Learning Experience
            </h2>
            <p className="text-lg text-muted-foreground/90 mb-8">
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
