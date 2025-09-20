import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setMessages, addMessage, setCurrentConversation } from '../../store/slices/chatSlice';
import { apiService } from '../../services/api';
import { webSocketService } from '../../services/websocket';
import { Message, RootStackParamList } from '../../types';
import MessageBubble from '../../components/chat/MessageBubble';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { conversationId } = route.params;

  const { messages, currentConversation } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);

  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const conversationMessages = messages[conversationId] || [];

  useEffect(() => {
    loadMessages();
    loadConversation();
    setupWebSocket();
  }, [conversationId]);

  const loadConversation = async () => {
    try {
      const conversation = await apiService.getConversation(conversationId);
      dispatch(setCurrentConversation(conversation));
      navigation.setOptions({ title: conversation.name || 'Chat' });
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getMessages(conversationId);
      dispatch(setMessages({ conversationId, messages: data }));
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const setupWebSocket = () => {
    webSocketService.joinConversation(conversationId);
    
    webSocketService.onMessage('chat_message', (data) => {
      if (data.conversation_id === conversationId) {
        dispatch(addMessage(data));
      }
    });
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !user) return;

    const message = messageText.trim();
    setMessageText('');

    try {
      // Send via WebSocket for real-time
      webSocketService.sendChatMessage(conversationId, message, user.id);
      
      // Also send via API for persistence
      const newMessage = await apiService.sendMessage(conversationId, message);
      dispatch(addMessage(newMessage));
    } catch (error: any) {
      Alert.alert('Error', 'Failed to send message');
      setMessageText(message); // Restore message text
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble message={item} isOwn={item.sender.id === user?.id} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No messages yet</Text>
      <Text style={styles.emptySubtext}>Start the conversation!</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        data={conversationMessages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={conversationMessages.length === 0 ? styles.emptyList : styles.messagesList}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!messageText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  messagesList: {
    paddingVertical: 16,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatScreen;
