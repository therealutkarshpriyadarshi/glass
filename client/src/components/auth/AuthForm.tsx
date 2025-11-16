import React, { useState, useEffect } from "react";
import { Lock, Mail, User, CheckCircle2 } from "lucide-react";
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
    if (strength === 0) return "bg-gray-600";
    if (strength === 1) return "bg-red-500";
    if (strength === 2) return "bg-orange-500";
    if (strength === 3) return "bg-yellow-500";
    return "bg-green-500";
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
                <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange("firstName")}
                    className={`pl-10 transition-all ${
                      errors.firstName
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "focus-visible:ring-blue-500 focus-visible:border-blue-500"
                    }`}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-xs text-red-400">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange("lastName")}
                    className={`pl-10 transition-all ${
                      errors.lastName
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "focus-visible:ring-purple-500 focus-visible:border-purple-500"
                    }`}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-xs text-red-400">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange("email")}
            className={`pl-10 transition-all ${
              errors.email
                ? "border-red-500 focus-visible:ring-red-500"
                : "focus-visible:ring-cyan-500 focus-visible:border-cyan-500"
            }`}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-400">{errors.email}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-400" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange("password")}
            className={`pl-10 transition-all ${
              errors.password
                ? "border-red-500 focus-visible:ring-red-500"
                : "focus-visible:ring-pink-500 focus-visible:border-pink-500"
            }`}
          />
        </div>
        {isSignUp && formData.password && (
          <div className="space-y-1">
            <div className="flex gap-1 h-1">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`flex-1 rounded-full transition-all ${
                    i < passwordStrength ? getPasswordStrengthColor(passwordStrength) : "bg-gray-700"
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: i < passwordStrength ? 1 : 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                />
              ))}
            </div>
            {passwordStrength > 0 && (
              <p className={`text-xs flex items-center gap-1 ${
                passwordStrength === 4 ? "text-green-400" :
                passwordStrength === 3 ? "text-yellow-400" :
                passwordStrength === 2 ? "text-orange-400" : "text-red-400"
              }`}>
                {passwordStrength === 4 && <CheckCircle2 className="h-3 w-3" />}
                {getPasswordStrengthText(passwordStrength)} password
              </p>
            )}
          </div>
        )}
        {errors.password && (
          <p className="text-xs text-red-400">
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
              <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  className={`pl-10 transition-all ${
                    errors.confirmPassword
                      ? "border-red-500 focus-visible:ring-red-500"
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? "border-green-500 focus-visible:ring-green-500"
                      : "focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                  }`}
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-400" />
                )}
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400">
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
        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/60 hover:scale-[1.02]"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <motion.div
              className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            Loading...
          </span>
        ) : (
          isSignUp ? "Create Account" : "Sign In"
        )}
      </Button>
    </form>
  );
};

export default AuthForm;
