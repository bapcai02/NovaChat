"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => void;
  onBackToLogin: () => void;
  isLoading?: boolean;
  error?: string;
  success?: boolean;
}

export default function ModernForgotPasswordForm({
  onSubmit,
  onBackToLogin,
  isLoading = false,
  error,
  success = false,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Clear error when user starts typing
    if (emailError) {
      setEmailError("");
    }
  };

  const validateEmail = () => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail()) {
      onSubmit(email);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md py-8"
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl mb-4"
            >
              <CheckCircle className="h-8 w-8 text-gray-800" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Check your email
            </h1>
            <p className="text-slate-400">
              We've sent a password reset link to your email
            </p>
          </div>

          {/* Success Card */}
          <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Email sent successfully!
                  </h3>
                  <p className="text-slate-300">
                    We've sent a password reset link to{" "}
                    <span className="font-medium text-blue-400">{email}</span>
                  </p>
                </div>

                <div className="text-sm text-slate-400 space-y-1">
                  <p>• Check your spam folder if you don't see the email</p>
                  <p>• The link will expire in 1 hour</p>
                  <p>• Contact support if you need help</p>
                </div>

                <div className="space-y-3 pt-4">
                  <Button
                    onClick={onBackToLogin}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-gray-800 font-medium py-2.5 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => onSubmit(email)}
                    className="w-full bg-white/5 border-white/20 text-slate-300 hover:bg-white/10 hover:text-gray-800"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resending...
                      </>
                    ) : (
                      "Resend email"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md py-8"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4"
          >
            <span className="text-2xl font-bold text-gray-800">N</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Forgot password?
          </h1>
          <p className="text-slate-400">
            No worries, we'll send you reset instructions
          </p>
        </div>

        {/* Forgot Password Form */}
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-gray-800">
              Reset password
            </CardTitle>
            <CardDescription className="text-center text-slate-300">
              Enter your email address and we'll send you a link to reset your
              password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-200"
                >
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleInputChange}
                    className={cn(
                      "pl-10 bg-white/5 border-white/20 text-gray-800 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20",
                      emailError &&
                        "border-red-400 focus:border-red-400 focus:ring-red-400/20",
                    )}
                    disabled={isLoading}
                  />
                </div>
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400"
                  >
                    {emailError}
                  </motion.p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-gray-800 font-medium py-2.5 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="text-center">
              <Button
                variant="link"
                className="text-blue-400 hover:text-blue-300 font-medium"
                onClick={onBackToLogin}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-xs text-slate-500">
                Remember your password?{" "}
                <Button
                  variant="link"
                  className="text-blue-400 hover:text-blue-300 p-0 text-xs"
                  onClick={onBackToLogin}
                  disabled={isLoading}
                >
                  Sign in
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
