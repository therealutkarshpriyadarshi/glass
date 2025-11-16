import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
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
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength === 0) return "bg-white/10";
    if (strength === 1) return "bg-white/20";
    if (strength === 2) return "bg-white/40";
    if (strength === 3) return "bg-white/60";
    return "bg-white/80";
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength === 0) return "";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

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
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Update password strength
    if (field === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }

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
                <Label htmlFor="firstName" className="text-white/60 text-sm">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange("firstName")}
                  className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:border-white/20 focus-visible:ring-0 transition-colors ${
                    errors.firstName ? "border-red-500/50" : ""
                  }`}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500/80">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-white/60 text-sm">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange("lastName")}
                  className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:border-white/20 focus-visible:ring-0 transition-colors ${
                    errors.lastName ? "border-red-500/50" : ""
                  }`}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500/80">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/60 text-sm">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange("email")}
          className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:border-white/20 focus-visible:ring-0 transition-colors ${
            errors.email ? "border-red-500/50" : ""
          }`}
        />
        {errors.email && (
          <p className="text-xs text-red-500/80">{errors.email}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-white/60 text-sm">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange("password")}
          className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:border-white/20 focus-visible:ring-0 transition-colors ${
            errors.password ? "border-red-500/50" : ""
          }`}
        />
        {isSignUp && formData.password && (
          <div className="space-y-1.5">
            <div className="flex gap-1 h-0.5">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`flex-1 rounded-full ${
                    i < passwordStrength ? getPasswordStrengthColor(passwordStrength) : "bg-white/5"
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: i < passwordStrength ? 1 : 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                />
              ))}
            </div>
            {passwordStrength > 0 && (
              <p className="text-xs text-white/40">
                {getPasswordStrengthText(passwordStrength)} password
              </p>
            )}
          </div>
        )}
        {errors.password && (
          <p className="text-xs text-red-500/80">
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
              <Label htmlFor="confirmPassword" className="text-white/60 text-sm">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:border-white/20 focus-visible:ring-0 transition-colors ${
                    errors.confirmPassword
                      ? "border-red-500/50"
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? "border-white/30"
                      : ""
                  }`}
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                  </motion.div>
                )}
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500/80">
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
        className="w-full mt-6 bg-white text-black hover:bg-white/90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <motion.div
              className="h-4 w-4 border-2 border-black/20 border-t-black rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
            {isSignUp ? "Creating account..." : "Signing in..."}
          </span>
        ) : (
          isSignUp ? "Create Account" : "Sign In"
        )}
      </Button>
    </form>
  );
};

export default AuthForm;
