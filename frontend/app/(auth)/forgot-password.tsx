import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import axios from 'axios';
import { API_URL } from '@/constants/Config';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', email);

      await axios.post(`${API_URL}/auth/forgot-password`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setIsSuccess(true);
    } catch (error) {
      console.error('Password reset request failed:', error);
      Alert.alert(
        'Error',
        'Failed to process your request. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successMessage}>
            We've sent password reset instructions to {email}. Please check your
            email and follow the link to reset your password.
          </Text>
          <Button
            title="Back to Login"
            variant="primary"
            size="lg"
            onPress={() => router.push('/(auth)/login-screen')}
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.neutral[800]} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you instructions to reset your
            password.
          </Text>
        </View>

        <Input
          label="Email"
          placeholder="Enter your email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          fullWidth
        />

        <Button
          title="Send Reset Link"
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          isLoading={isLoading}
          fullWidth
          style={styles.submitButton}
        />

        <TouchableOpacity
          onPress={() => router.push('/(auth)/login-screen')}
          style={styles.loginLink}
        >
          <Text style={styles.loginLinkText}>Back to Login</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <LoadingSpinner fullScreen text="Sending reset instructions..." />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    padding: Layout.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    marginBottom: Layout.spacing.lg,
  },
  header: {
    marginBottom: Layout.spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.neutral[900],
    marginBottom: Layout.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.neutral[600],
    lineHeight: 22,
  },
  submitButton: {
    marginTop: Layout.spacing.lg,
  },
  loginLink: {
    marginTop: Layout.spacing.md,
    alignItems: 'center',
  },
  loginLinkText: {
    color: Colors.primary[500],
    fontSize: 16,
    fontWeight: '500',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.success.main,
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
    lineHeight: 24,
  },
});