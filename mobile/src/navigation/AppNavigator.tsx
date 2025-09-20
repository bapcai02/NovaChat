import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { RootStackParamList } from '../types';

// Import screens
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import ChatScreen from '../screens/chat/ChatScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ProfileScreen from '../screens/settings/ProfileScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen}
              options={{ 
                headerShown: true,
                title: 'Chat',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ 
                headerShown: true,
                title: 'Settings',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ 
                headerShown: true,
                title: 'Profile',
                headerBackTitleVisible: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
