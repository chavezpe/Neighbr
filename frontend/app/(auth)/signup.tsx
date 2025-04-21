import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Info } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

export default function Signup() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hoaCode, setHoaCode] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    hoaCode?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!hoaCode.trim()) {
      newErrors.hoaCode = 'HOA code is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      await signup(name, email, password, hoaCode);
      // Navigation will be handled by the auth context
    } catch (error) {
      Alert.alert('Signup Failed', error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.neutral[800]} />
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join your community on Neighbr</Text>
        </View>
        
        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={errors.name}
            fullWidth
          />
          
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            fullWidth
          />
          
          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
            helper="Password must be at least 8 characters"
            fullWidth
          />
          
          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={errors.confirmPassword}
            fullWidth
          />
          
          <Input
            label="HOA Code"
            placeholder="Enter your community's HOA code"
            value={hoaCode}
            onChangeText={setHoaCode}
            autoCapitalize="characters"
            error={errors.hoaCode}
            fullWidth
          />
          
          <Card style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Info size={20} color={Colors.primary[500]} style={styles.infoIcon} />
              <Text style={styles.infoText}>
                Don't have an HOA code? Contact your community administrator or{' '}
                <Text 
                  style={styles.createCommunityLink}
                  onPress={() => router.push('/(auth)/create-community')}
                >
                  create a new community
                </Text>
              </Text>
            </View>
          </Card>
          
          <Button
            title="Sign Up"
            variant="primary"
            size="lg"
            onPress={handleSignup}
            isLoading={isLoading}
            fullWidth
            style={styles.button}
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login-screen')}>
            <Text style={styles.loginText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {isLoading && <LoadingSpinner fullScreen text="Creating your account..." />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
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
  },
  form: {
    marginBottom: Layout.spacing.xl,
  },
  infoCard: {
    backgroundColor: Colors.primary[50],
    marginVertical: Layout.spacing.md,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: Layout.spacing.sm,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.neutral[700],
  },
  createCommunityLink: {
    color: Colors.primary[500],
    fontWeight: '600',
  },
  button: {
    marginTop: Layout.spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: Layout.spacing.lg,
  },
  footerText: {
    color: Colors.neutral[600],
    marginRight: 4,
  },
  loginText: {
    color: Colors.primary[500],
    fontWeight: '600',
  },
});