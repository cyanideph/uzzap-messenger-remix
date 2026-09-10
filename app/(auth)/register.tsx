import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from 'react-native';

const { width } = Dimensions.get('window');
const LOGO_SIZE = width * 0.3; // 30% of screen width

export default function RegisterScreen() {
  const { signUp, loading } = useAuth();
  const colorScheme = useColorScheme();
  const [formData, setFormData] = useState({
    userId: '',
    mobileNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const validateForm = () => {
    if (formData.userId.length < 6 || formData.userId.length > 12) {
      Alert.alert('Error', 'User ID must be between 6 to 12 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9]+$/.test(formData.userId)) {
      Alert.alert('Error', 'User ID can only contain letters and numbers');
      return false;
    }
    if (formData.mobileNumber && !formData.mobileNumber.startsWith('+')) {
      Alert.alert('Error', 'If providing a mobile number, it must be in international format (e.g., +639205008429)');
      return false;
    }
    if (!formData.email) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!formData.firstName || !formData.lastName) {
      Alert.alert('Error', 'First name and last name are required');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      console.log('Starting registration process...');
      const { error } = await signUp({
        email: formData.email,
        password: formData.password,
        phone: formData.mobileNumber || '',
        options: {
          data: {
            user_id: formData.userId,
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      });

      console.log('Registration response:', error ? 'Error: ' + error : 'Success');

      if (error) {
        if (error.toLowerCase().includes('email')) {
          Alert.alert('Error', 'This email is already registered. Please use a different email or try logging in.');
        } else if (error.toLowerCase().includes('phone')) {
          Alert.alert('Error', 'This mobile number is already registered. Please use a different number or try logging in.');
        } else {
          Alert.alert('Error', error);
        }
        return;
      }

      Alert.alert(
        'Success',
        formData.mobileNumber 
          ? 'Account created successfully! Please verify your mobile number.'
          : 'Account created successfully! You can now log in.',
        [
          {
            text: 'OK',
            onPress: () => formData.mobileNumber ? router.push('/verify') : router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Error',
        'Failed to create account. Please check your internet connection and try again.'
      );
    }
  };

  return (
    <ScrollView 
      style={[
        styles.container,
        { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[
          styles.title,
          { color: colorScheme === 'dark' ? '#fff' : '#000' }
        ]}>
          Create Account
        </Text>
        <Text style={[
          styles.subtitle,
          { color: colorScheme === 'dark' ? '#8e8e93' : '#6c6c70' }
        ]}>
          Join Uzzap to start messaging
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={[
          styles.label,
          { color: colorScheme === 'dark' ? '#fff' : '#000' }
        ]}>User ID</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
              color: colorScheme === 'dark' ? '#fff' : '#000',
              borderColor: colorScheme === 'dark' ? '#2c2c2e' : '#e5e5ea',
            },
          ]}
          placeholder="6-12 characters, letters and numbers only"
          placeholderTextColor={colorScheme === 'dark' ? '#8e8e93' : '#6c6c70'}
          value={formData.userId}
          onChangeText={(text) => setFormData({ ...formData, userId: text })}
          autoCapitalize="none"
        />

        <Text style={[
          styles.label,
          { color: colorScheme === 'dark' ? '#fff' : '#000' }
        ]}>Email Address</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
              color: colorScheme === 'dark' ? '#fff' : '#000',
              borderColor: colorScheme === 'dark' ? '#2c2c2e' : '#e5e5ea',
            },
          ]}
          placeholder="Enter your email"
          placeholderTextColor={colorScheme === 'dark' ? '#8e8e93' : '#6c6c70'}
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={[
          styles.label,
          { color: colorScheme === 'dark' ? '#fff' : '#000' }
        ]}>Password</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
              color: colorScheme === 'dark' ? '#fff' : '#000',
              borderColor: colorScheme === 'dark' ? '#2c2c2e' : '#e5e5ea',
            },
          ]}
          placeholder="At least 6 characters"
          placeholderTextColor={colorScheme === 'dark' ? '#8e8e93' : '#6c6c70'}
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
        />

        <Text style={[
          styles.label,
          { color: colorScheme === 'dark' ? '#fff' : '#000' }
        ]}>Confirm Password</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
              color: colorScheme === 'dark' ? '#fff' : '#000',
              borderColor: colorScheme === 'dark' ? '#2c2c2e' : '#e5e5ea',
            },
          ]}
          placeholder="Re-enter your password"
          placeholderTextColor={colorScheme === 'dark' ? '#8e8e93' : '#6c6c70'}
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          secureTextEntry
        />

        <Text style={[
          styles.label,
          { color: colorScheme === 'dark' ? '#fff' : '#000' }
        ]}>Mobile Number <Text style={styles.optionalText}>(Optional)</Text></Text>
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
          value={formData.mobileNumber}
          onChangeText={(text) => setFormData({ ...formData, mobileNumber: text })}
          keyboardType="phone-pad"
        />

        <Text style={[
          styles.label,
          { color: colorScheme === 'dark' ? '#fff' : '#000' }
        ]}>First Name</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
              color: colorScheme === 'dark' ? '#fff' : '#000',
              borderColor: colorScheme === 'dark' ? '#2c2c2e' : '#e5e5ea',
            },
          ]}
          placeholder="Enter your first name"
          placeholderTextColor={colorScheme === 'dark' ? '#8e8e93' : '#6c6c70'}
          value={formData.firstName}
          onChangeText={(text) => setFormData({ ...formData, firstName: text })}
        />

        <Text style={[
          styles.label,
          { color: colorScheme === 'dark' ? '#fff' : '#000' }
        ]}>Last Name</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
              color: colorScheme === 'dark' ? '#fff' : '#000',
              borderColor: colorScheme === 'dark' ? '#2c2c2e' : '#e5e5ea',
            },
          ]}
          placeholder="Enter your last name"
          placeholderTextColor={colorScheme === 'dark' ? '#8e8e93' : '#6c6c70'}
          value={formData.lastName}
          onChangeText={(text) => setFormData({ ...formData, lastName: text })}
        />

        <TouchableOpacity 
          style={[
            styles.registerButton,
            loading && styles.registerButtonDisabled
          ]} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.registerButtonText}>Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={[
            styles.loginText,
            { color: colorScheme === 'dark' ? '#8e8e93' : '#6c6c70' }
          ]}>
            Already have an account?{' '}
            <Text style={[styles.loginLinkText, { color: '#007AFF' }]}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  registerButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: {
    backgroundColor: '#B4D8FF',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
    marginBottom: 40,
  },
  loginText: {
    fontSize: 14,
  },
  loginLinkText: {
    fontWeight: '600',
  },
  optionalText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#8e8e93',
  },
}); 