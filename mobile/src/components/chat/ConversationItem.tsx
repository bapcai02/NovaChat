import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Conversation } from '../../types';
import CustomAvatar from '../ui/CustomAvatar';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  onPress,
}) => {
  const getDisplayName = () => {
    if (conversation.name) {
      return conversation.name;
    }
    if (conversation.type === 'direct' && conversation.members && conversation.members.length > 0) {
      return conversation.members[0].name;
    }
    return 'Unknown';
  };

  const getLastMessage = () => {
    if (conversation.last_message) {
      return conversation.last_message.content;
    }
    return 'No messages yet';
  };

  const getAvatar = () => {
    if (conversation.type === 'direct' && conversation.members && conversation.members.length > 0) {
      return conversation.members[0].avatar;
    }
    return undefined;
  };

  const getAvatarName = () => {
    if (conversation.type === 'direct' && conversation.members && conversation.members.length > 0) {
      return conversation.members[0].name;
    }
    return getDisplayName();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <CustomAvatar
        src={getAvatar()}
        name={getAvatarName()}
        size="md"
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {getDisplayName()}
          </Text>
          {conversation.unread_count > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.lastMessage} numberOfLines={1}>
          {getLastMessage()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666666',
  },
});

export default ConversationItem;
