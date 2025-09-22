import React from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginForm from './src/components/LoginForm';
import LoadingScreen from './src/components/LoadingScreen';

// Main App Component
const AppContent: React.FC = () => {
  const { state } = useAuth();

  // Show loading screen while checking auth
  if (state.isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  // Show login form if not authenticated
  if (!state.isAuthenticated) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Background Pattern */}
        <View style={styles.backgroundPattern} />
        
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <LoginForm />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Show main app if authenticated
  return (
    <View style={styles.mainContainer}>
      <View style={styles.mainContent}>
        <View style={styles.logo}>
          <View style={styles.logoIcon}>
            <View style={styles.logoInner}>
              <View style={styles.logoText}>N</View>
            </View>
          </View>
        </View>
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeText}>Welcome to NovaChat!</View>
          <View style={styles.userInfo}>
            <View style={styles.userName}>Hello, {state.user?.name}!</View>
            <View style={styles.userEmail}>{state.user?.email}</View>
          </View>
        </View>
      </View>
    </View>
  );
};

// Root App Component with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  // Login Container
  container: {
    flex: 1,
    backgroundColor: '#FEF3C7', // amber-50 gradient background
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    minHeight: '100vh',
    marginHorizontal: 'auto',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    backgroundColor: '#F59E0B', // amber-500 for pattern
  },
  scrollContainer: {
    flexGrow: 1,
  },

  // Main App Container (after login)
  mainContainer: {
    flex: 1,
    backgroundColor: '#FEF3C7', // amber-50
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    minHeight: '100vh',
    marginHorizontal: 'auto',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    marginBottom: 32,
  },
  logoIcon: {
    width: 100,
    height: 100,
    backgroundColor: '#F59E0B', // amber-500
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logoInner: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F59E0B', // amber-500
  },
  welcomeContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
    textAlign: 'center',
    marginBottom: 16,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151', // gray-700
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280', // gray-500
  },
});