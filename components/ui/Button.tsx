import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacityProps,
  ViewStyle,
  TextStyle 
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...props
}) => {
  // Determine container style based on variant and size
  const getContainerStyle = () => {
    let baseStyle: ViewStyle = {
      ...styles.container,
      ...styles[`${size}Container`],
    };

    if (variant === 'primary') {
      baseStyle = {
        ...baseStyle,
        backgroundColor: '#007AFF',
      };
    } else if (variant === 'secondary') {
      baseStyle = {
        ...baseStyle,
        backgroundColor: '#5856D6',
      };
    } else if (variant === 'outline') {
      baseStyle = {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#007AFF',
      };
    }

    if (disabled) {
      baseStyle = {
        ...baseStyle,
        opacity: 0.5,
      };
    }

    return baseStyle;
  };

  // Determine text style based on variant
  const getTextStyle = () => {
    let baseStyle: TextStyle = {
      ...styles.text,
      ...styles[`${size}Text`],
    };

    if (variant === 'outline') {
      baseStyle = {
        ...baseStyle,
        color: '#007AFF',
      };
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getContainerStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' ? '#007AFF' : '#FFFFFF'} />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  smallContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mediumContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  largeContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});

export default Button; 