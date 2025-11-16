import React, { useState, useEffect } from "react";
import { Lock, Mail, IdCard } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <AnimatePresence>
        {isSignUp && (
          <motion.div
            key="name-fields"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <Label htmlFor="firstName" className="sr-only">
                First Name
              </Label>
              <div className="relative">
                <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange("firstName")}
                  className="pl-12 h-12 rounded-full"
                />
              </div>
              {errors.firstName && (
                <p className="mt-1 ml-4 text-sm text-destructive">
                  {errors.firstName}
                </p>
              )}
            </div>
            <div className="mb-6">
              <Label htmlFor="lastName" className="sr-only">
                Last Name
              </Label>
              <div className="relative">
                <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange("lastName")}
                  className="pl-12 h-12 rounded-full"
                />
              </div>
              {errors.lastName && (
                <p className="mt-1 ml-4 text-sm text-destructive">
                  {errors.lastName}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mb-6">
        <Label htmlFor="email" className="sr-only">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange("email")}
            className="pl-12 h-12 rounded-full"
          />
        </div>
        {errors.email && (
          <p className="mt-1 ml-4 text-sm text-destructive">{errors.email}</p>
        )}
      </div>
      <div className="mb-6">
        <Label htmlFor="password" className="sr-only">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange("password")}
            className="pl-12 h-12 rounded-full"
          />
        </div>
        {errors.password && (
          <p className="mt-1 ml-4 text-sm text-destructive">
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
            <div className="mb-6">
              <Label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  className="pl-12 h-12 rounded-full"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 ml-4 text-sm text-destructive">
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
        className="w-full h-12 rounded-full text-base font-bold uppercase tracking-wider"
      >
        {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
      </Button>
    </form>
  );
};

export default AuthForm;
