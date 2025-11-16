import React, { useState, useEffect } from "react";
import { Lock, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFormProps {
  isSignUp: boolean;
  isLoading: boolean;
  onFinish: (values: unknown) => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

/**
 * AuthForm component for handling user authentication (sign up and sign in).
 *
 * This component renders a form with fields for email and password,
 * and additional fields for first name, last name, and password confirmation when in sign up mode.
 * It uses shadcn/ui components for form elements and Framer Motion for animations.
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
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    // Clear name fields when switching from sign up to sign in
    if (!isSignUp) {
      setFormData((prev) => ({
        ...prev,
        firstName: "",
        lastName: "",
        confirmPassword: "",
      }));
      setErrors({});
    }
  }, [isSignUp]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (isSignUp) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = "Please input your first name!";
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = "Please input your last name!";
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please input your email!";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address!";
    }

    if (!formData.password) {
      newErrors.password = "Please input your password!";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long!";
    }

    if (isSignUp) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password!";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "The two passwords do not match!";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onFinish(formData);
    }
  };

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AnimatePresence>
        {isSignUp && (
          <motion.div
            key="name-fields"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange("firstName")}
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange("lastName")}
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange("email")}
            className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange("password")}
            className={`pl-10 ${errors.password ? "border-destructive" : ""}`}
          />
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">
            {errors.password}
          </p>
        )}
      </div>
      <AnimatePresence>
        {isSignUp && (
          <motion.div
            key="confirm-password"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  className={`pl-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full mt-6"
      >
        {isLoading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
      </Button>
    </form>
  );
};

export default AuthForm;
