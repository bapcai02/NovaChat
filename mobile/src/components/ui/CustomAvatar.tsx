import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface CustomAvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

const CustomAvatar: React.FC<CustomAvatarProps> = ({
  src,
  name = 'U',
  size = 'md',
  style,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const sizeStyles = {
    sm: { width: 32, height: 32, fontSize: 12 },
    md: { width: 48, height: 48, fontSize: 16 },
    lg: { width: 64, height: 64, fontSize: 20 },
  };

  const currentSize = sizeStyles[size];

  const getInitials = (name: string): string => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const getRandomColor = (name: string): string => {
    const colors = [
      '#ef4444', // red-500
      '#f97316', // orange-500
      '#eab308', // yellow-500
      '#22c55e', // green-500
      '#3b82f6', // blue-500
      '#a855f7', // purple-500
      '#ec4899', // pink-500
      '#6366f1', // indigo-500
      '#06b6d4', // cyan-500
      '#10b981', // emerald-500
      '#f59e0b', // amber-500
      '#8b5cf6', // violet-500
      '#f43f5e', // rose-500
      '#14b8a6', // teal-500
      '#84cc16', // lime-500
      '#0ea5e9', // sky-500
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const showImage = src && !imageError && imageLoaded;
  const initials = getInitials(name);
  const backgroundColor = getRandomColor(name);

  return (
    <View style={[styles.container, currentSize, style]}>
      {src && !imageError && (
        <Image
          source={{ uri: src }}
          style={[styles.image, currentSize]}
          onError={() => setImageError(true)}
          onLoad={() => setImageLoaded(true)}
        />
      )}
      
      {!showImage && (
        <View
          style={[
            styles.fallback,
            currentSize,
            { backgroundColor },
          ]}
        >
          <Text style={[styles.initials, { fontSize: currentSize.fontSize }]}>
            {initials}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    borderRadius: 50,
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default CustomAvatar;
