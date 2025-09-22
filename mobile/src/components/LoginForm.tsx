import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials } from '../types';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
  onForgotPassword?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onForgotPassword,
}) => {
  const { state, login, clearError } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const fillCredentials = (email: string, password: string) => {
    setFormData({ email, password });
    clearError();
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await login(formData);
    } catch (error) {
      // Error is handled by AuthContext
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>N</Text>
          </View>
        </View>
        <Text style={styles.title}>Welcome Back</Text>
      </View>

      {/* Login Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sign In</Text>

        <View style={styles.form}>
          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!state.isLoading}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!state.isLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message */}
          {state.error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{state.error}</Text>
            </View>
          ) : null}

          {/* Remember Me & Forgot Password */}
          <View style={styles.optionsContainer}>
            <View style={styles.rememberContainer}>
              <TouchableOpacity style={styles.checkbox}>
                <Text style={styles.checkboxText}>☐</Text>
              </TouchableOpacity>
              <Text style={styles.rememberText}>Remember me</Text>
            </View>
            <TouchableOpacity onPress={onForgotPassword}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, state.isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={state.isLoading}
          >
            <Text style={styles.buttonText}>
              {state.isLoading ? 'Signing in...' : 'Sign In →'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Demo Credentials */}
        <View style={styles.demoContainer}>
          <View style={styles.demoCard}>
            <View style={styles.demoHeader}>
              <Text style={styles.demoIcon}>👤</Text>
              <Text style={styles.demoTitle}>Admin Account</Text>
            </View>
            <View style={styles.demoCredentials}>
              <View style={styles.demoRow}>
                <Text style={styles.demoLabel}>Email:</Text>
                <Text style={styles.demoValue}>admin@example.com</Text>
              </View>
              <View style={styles.demoRow}>
                <Text style={styles.demoLabel}>Password:</Text>
                <Text style={styles.demoValue}>password</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => fillCredentials('admin@example.com', 'password')}
            >
              <Text style={styles.demoButtonText}>Use Demo Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Switch to Register */}
        {onSwitchToRegister && (
          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onSwitchToRegister}>
              <Text style={styles.switchLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#F59E0B', // amber-500
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)', // amber-500/20
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937', // gray-800
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151', // gray-700
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    borderRadius: 8,
    height: 48,
  },
  inputIcon: {
    fontSize: 16,
    marginLeft: 12,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827', // gray-900
    paddingVertical: 12,
    paddingRight: 12,
  },
  eyeButton: {
    padding: 12,
  },
  eyeIcon: {
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // red-500/10
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)', // red-500/20
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626', // red-600
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxText: {
    fontSize: 16,
    color: '#6B7280', // gray-500
  },
  rememberText: {
    fontSize: 14,
    color: '#6B7280', // gray-500
  },
  forgotText: {
    fontSize: 14,
    color: '#F59E0B', // amber-500
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#F59E0B', // amber-500
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB', // gray-300
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  demoContainer: {
    marginTop: 24,
  },
  demoCard: {
    backgroundColor: '#EFF6FF', // blue-50
    borderWidth: 1,
    borderColor: '#BFDBFE', // blue-200
    borderRadius: 8,
    padding: 16,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  demoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937', // gray-800
  },
  demoCredentials: {
    marginBottom: 12,
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  demoLabel: {
    fontSize: 12,
    color: '#6B7280', // gray-500
  },
  demoValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#F3F4F6', // gray-100
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    color: '#1F2937', // gray-800
  },
  demoButton: {
    backgroundColor: '#3B82F6', // blue-500
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  switchText: {
    fontSize: 14,
    color: '#6B7280', // gray-500
  },
  switchLink: {
    fontSize: 14,
    color: '#F59E0B', // amber-500
    fontWeight: '600',
  },
});

export default LoginForm;
