import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from 'react-native';

const { width } = Dimensions.get('window');
const LOGO_SIZE = width * 0.4; // 40% of screen width

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loading } = useAuth();
  const colorScheme = useColorScheme();
  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mobileNumber: '',
  });

  const handleLogin = async () => {
    try {
      if (loginMethod === 'email') {
        if (!formData.email || !formData.password) {
          Alert.alert('Error', 'Please enter both email and password');
          return;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          Alert.alert('Error', 'Please enter a valid email address');
          return;
        }
        const result = await signIn({ email: formData.email, password: formData.password });
        if (result?.error) {
          Alert.alert('Error', result.error);
          return;
        }
        router.replace('/(drawer)');
      } else {
        if (!formData.mobileNumber) {
          Alert.alert('Error', 'Please enter your mobile number');
          return;
        }
        if (!/^\+?[1-9]\d{1,14}$/.test(formData.mobileNumber)) {
          Alert.alert('Error', 'Please enter a valid mobile number (e.g., +639205008429)');
          return;
        }
        const result = await signIn({ mobile: formData.mobileNumber });
        if (result?.error) {
          Alert.alert('Error', result.error);
          return;
        }
        router.push('/verify');
      }
    } catch {
      Alert.alert('Error', 'Failed to sign in. Please try again.');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' },
      ]}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text
        style={[
          styles.title,
          { color: colorScheme === 'dark' ? '#fff' : '#000' },
        ]}
      >
        Welcome to Uzzap
      </Text>
      <Text
        style={[
          styles.subtitle,
          { color: colorScheme === 'dark' ? '#8e8e93' : '#6c6c70' },
        ]}
      >
        Sign in to continue
      </Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            loginMethod === 'email' && styles.toggleButtonActive,
            { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' },
          ]}
          onPress={() => setLoginMethod('email')}
        >
          <Text
            style={[
              styles.toggleButtonText,
              loginMethod === 'email' && styles.toggleButtonTextActive,
              { color: colorScheme === 'dark' ? '#fff' : '#000' },
            ]}
          >
            Email
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            loginMethod === 'mobile' && styles.toggleButtonActive,
            { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' },
          ]}
          onPress={() => setLoginMethod('mobile')}
        >
          <Text
            style={[
              styles.toggleButtonText,
              loginMethod === 'mobile' && styles.toggleButtonTextActive,
              { color: colorScheme === 'dark' ? '#fff' : '#000' },
            ]}
          >
            Mobile
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        {loginMethod === 'email' ? (
          <>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
                  color: colorScheme === 'dark' ? '#fff' : '#000',
                  borderColor: colorScheme === 'dark' ? '#2c2c2e' : '#e5e5ea',
                },
              ]}
              placeholder="Email"
              placeholderTextColor={colorScheme === 'dark' ? '#8e8e93' : '#6c6c70'}
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
                  color: colorScheme === 'dark' ? '#fff' : '#000',
                  borderColor: colorScheme === 'dark' ? '#2c2c2e' : '#e5e5ea',
                },
              ]}
              placeholder="Password"
              placeholderTextColor={colorScheme === 'dark' ? '#8e8e93' : '#6c6c70'}
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
            />
          </>
        ) : (
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
                color: colorScheme === 'dark' ? '#fff' : '#000',
                borderColor: colorScheme === 'dark' ? '#2c2c2e' : '#e5e5ea',
              },
            ]}
            placeholder="+639XXXXXXXXX"
            placeholderTextColor={colorScheme === 'dark' ? '#8e8e93' : '#6c6c70'}
            keyboardType="phone-pad"
            value={formData.mobileNumber}
            onChangeText={(text) => setFormData({ ...formData, mobileNumber: text })}
          />
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={[styles.registerText, { color: colorScheme === 'dark' ? '#8e8e93' : '#6c6c70' }]}>
            Don't have an account?{' '}
            <Text style={[styles.registerLinkText, { color: '#007AFF' }]}>Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 12,
    padding: 4,
    backgroundColor: '#f2f2f7',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    fontWeight: '600',
    color: '#007AFF',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: '#B4D8FF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
  },
  registerLinkText: {
    fontWeight: '600',
  },
}); 