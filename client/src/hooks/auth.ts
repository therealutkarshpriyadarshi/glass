import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { signIn, signUp } from "../store/auth/authSlice";
import { SignUpData, SignInData } from "../store/auth/types";

interface AuthHook {
  isSignUp: boolean;
  isLoading: boolean;
  error: string | null;
  onFinish: (values: unknown) => void;
  toggleAuthMode: () => void;
}

/**
 * Custom hook for handling authentication-related functionality.
 *
 * @returns {AuthHook} An object containing authentication-related state and functions.
 */
export const useAuth = (): AuthHook => {
  const [isSignUp, setIsSignUp] = useState(false);
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  /**
   * Handles form submission for sign up or sign in.
   *
   * @param {unknown} values - The form values submitted by the user.
   */
  const onFinish = (values: unknown) => {
    if (isSignUp) {
      dispatch(signUp(values as SignUpData));
    } else {
      dispatch(signIn(values as SignInData));
    }
  };

  /**
   * Toggles between sign up and sign in modes.
   */
  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
  };

  return { isSignUp, isLoading, error, onFinish, toggleAuthMode };
};
