import React, { useState } from 'react';
import { 
  TextInput as RNTextInput, 
  View, 
  StyleSheet, 
  TextInputProps as RNTextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TextInputProps extends RNTextInputProps {
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  error?: string;
  isPassword?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  containerStyle,
  inputStyle,
  error,
  isPassword = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(isPassword);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    props.onFocus && props.onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    props.onBlur && props.onBlur(e);
  };

  const togglePasswordVisibility = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <View style={[styles.container, containerStyle, error ? styles.errorContainer : null]}>
      <RNTextInput
        style={[
          styles.input,
          inputStyle,
          isFocused ? styles.focusedInput : null,
          isPassword ? styles.passwordInput : null,
        ]}
        placeholderTextColor="#999"
        onFocus={handleFocus}
        onBlur={handleBlur}
        secureTextEntry={secureTextEntry}
        {...props}
      />
      {isPassword && (
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={togglePasswordVisibility}
          activeOpacity={0.7}
        >
          <Ionicons
            name={secureTextEntry ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  passwordInput: {
    paddingRight: 50,
  },
  focusedInput: {
    borderColor: '#007AFF',
  },
  errorContainer: {
    borderColor: '#FF3B30',
  },
  passwordToggle: {
    position: 'absolute',
    right: 10,
    height: '100%',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
});

export default TextInput; 