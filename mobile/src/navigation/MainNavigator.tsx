import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MainTabParamList } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import main screens
import ConversationsScreen from '../screens/chat/ConversationsScreen';
import TeamsScreen from '../screens/teams/TeamsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Conversations':
              iconName = 'chat';
              break;
            case 'Teams':
              iconName = 'group';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Conversations" 
        component={ConversationsScreen}
        options={{ title: 'Chats' }}
      />
      <Tab.Screen 
        name="Teams" 
        component={TeamsScreen}
        options={{ title: 'Teams' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
