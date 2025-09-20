import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Message } from '../../types';
import CustomAvatar from '../ui/CustomAvatar';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, isOwn && styles.ownContainer]}>
      {!isOwn && (
        <CustomAvatar
          src={message.sender.avatar}
          name={message.sender.name}
          size="sm"
          style={styles.avatar}
        />
      )}
      
      <View style={[styles.bubble, isOwn && styles.ownBubble]}>
        {!isOwn && (
          <Text style={styles.senderName}>{message.sender.name}</Text>
        )}
        <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
          {message.content}
        </Text>
        <Text style={[styles.timestamp, isOwn && styles.ownTimestamp]}>
          {formatTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  ownContainer: {
    justifyContent: 'flex-end',
  },
  avatar: {
    marginRight: 8,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '80%',
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 11,
    color: '#999999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownTimestamp: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
});

export default MessageBubble;
