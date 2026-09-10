import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from 'react-native';

export default function VerifyScreen() {
  const router = useRouter();
  const { verifyPin, loading } = useAuth();
  const colorScheme = useColorScheme();
  const [pin, setPin] = useState('');

  const handleVerify = async () => {
    try {
      if (!pin) {
        Alert.alert('Error', 'Please enter the verification code');
        return;
      }

      await verifyPin(pin);
      router.replace('/(drawer)');
    } catch (err) {
      console.error('Verification error:', err);
      Alert.alert('Error', 'Invalid verification code');
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: colorScheme === 'dark' ? '#fff' : '#000' },
        ]}
      >
        Enter Verification Code
      </Text>
      <Text
        style={[
          styles.subtitle,
          { color: colorScheme === 'dark' ? '#8e8e93' : '#6c6c70' },
        ]}
      >
        We've sent a verification code to your mobile number
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
              color: colorScheme === 'dark' ? '#fff' : '#000',
            },
          ]}
          placeholder="Enter 6-digit code"
          placeholderTextColor={colorScheme === 'dark' ? '#8e8e93' : '#6c6c70'}
          keyboardType="number-pad"
          maxLength={6}
          value={pin}
          onChangeText={setPin}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={() => router.back()}
      >
        <Text
          style={[
            styles.resendText,
            { color: colorScheme === 'dark' ? '#007AFF' : '#007AFF' },
          ]}
        >
          Resend Code
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 