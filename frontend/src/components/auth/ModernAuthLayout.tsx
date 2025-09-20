'use client';

import React from 'react';
import ModernLoginForm from './ModernLoginForm';

interface AuthLayoutProps {
  onLogin?: (data: { email: string; password: string }) => void;
  onRegister?: (data: {
    name: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }) => void;
  isLoading?: boolean;
  error?: string;
  onForgotPassword?: () => void;
}

export default function ModernAuthLayout({
  onLogin,
  isLoading = false,
  error,
}: AuthLayoutProps) {
  const handleLogin = (data: { email: string; password: string }) => {
    onLogin?.(data);
  };

  return (
    <ModernLoginForm
      onSubmit={handleLogin}
      isLoading={isLoading}
      error={error}
      onSwitchToRegister={() => {}}
      onForgotPassword={() => {}}
    />
  );
}
