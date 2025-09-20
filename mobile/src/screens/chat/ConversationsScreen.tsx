import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState, AppDispatch } from '../../store';
import { setConversations, setLoading } from '../../store/slices/chatSlice';
import { apiService } from '../../services/api';
import { webSocketService } from '../../services/websocket';
import { Conversation, RootStackParamList } from '../../types';
import ConversationItem from '../../components/chat/ConversationItem';

type ConversationsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const ConversationsScreen: React.FC = () => {
  const navigation = useNavigation<ConversationsScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { conversations, isLoading } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConversations();
    setupWebSocket();
  }, []);

  const setupWebSocket = () => {
    if (user) {
      webSocketService.connect(user.id.toString()).catch(console.error);
    }
  };

  const loadConversations = async () => {
    try {
      dispatch(setLoading(true));
      const data = await apiService.getConversations();
      dispatch(setConversations(data));
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate('Chat', { conversationId: conversation.id });
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <ConversationItem
      conversation={item}
      onPress={() => handleConversationPress(item)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No conversations yet</Text>
      <Text style={styles.emptySubtext}>Start a new conversation to get started</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderConversation}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        contentContainerStyle={conversations.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default ConversationsScreen;
