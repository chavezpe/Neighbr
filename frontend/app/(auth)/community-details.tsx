import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { createCommunity } from '@/api/auth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

export default function CommunityDetails() {
  const { households } = useLocalSearchParams<{ households: string }>();
  const maxHouseholds = parseInt(households || '25', 10);
  
  const [communityName, setCommunityName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    communityName?: string;
    adminName?: string;
    adminEmail?: string;
    adminPassword?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hoaCode, setHoaCode] = useState<string | null>(null);

  const validate = () => {
    const newErrors: typeof errors = {};
    
    if (!communityName.trim()) {
      newErrors.communityName = 'Community name is required';
    }
    
    if (!adminName.trim()) {
      newErrors.adminName = 'Admin name is required';
    }
    
    if (!adminEmail) {
      newErrors.adminEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(adminEmail)) {
      newErrors.adminEmail = 'Email is invalid';
    }
    
    if (!adminPassword) {
      newErrors.adminPassword = 'Password is required';
    } else if (adminPassword.length < 8) {
      newErrors.adminPassword = 'Password must be at least 8 characters';
    }
    
    if (adminPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCommunity = async () => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      const response = await createCommunity(
        communityName,
        maxHouseholds,
        adminName,
        adminEmail,
        adminPassword
      );
      
      setHoaCode(response.hoa_code);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create community');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    router.push('/(auth)/login-screen');
  };

  if (hoaCode) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>Community Created!</Text>
          <Text style={styles.successMessage}>
            Your community "{communityName}" has been successfully created.
          </Text>
          
          <View style={styles.hoaCodeContainer}>
            <Text style={styles.hoaCodeLabel}>Your HOA Code:</Text>
            <Text style={styles.hoaCode}>{hoaCode}</Text>
            <Text style={styles.hoaCodeInfo}>
              Share this code with community members so they can join.
            </Text>
          </View>
          
          <Button
            title="Continue to Login"
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleContinue}
            style={styles.continueButton}
          />
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.title}>Create Community</Text>
          <Text style={styles.subtitle}>Set up your HOA community</Text>
        </View>
        
        <View style={styles.form}>
          <Input
            label="Community Name"
            placeholder="Enter your community's name"
            value={communityName}
            onChangeText={setCommunityName}
            error={errors.communityName}
            fullWidth
          />
          
          <View style={styles.planInfo}>
            <Text style={styles.planInfoText}>
              Plan: Maximum {maxHouseholds} Households
            </Text>
          </View>
          
          <Text style={styles.sectionTitle}>Admin Account</Text>
          
          <Input
            label="Admin Name"
            placeholder="Enter admin's full name"
            value={adminName}
            onChangeText={setAdminName}
            autoCapitalize="words"
            error={errors.adminName}
            fullWidth
          />
          
          <Input
            label="Admin Email"
            placeholder="Enter admin's email"
            value={adminEmail}
            onChangeText={setAdminEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.adminEmail}
            fullWidth
          />
          
          <Input
            label="Admin Password"
            placeholder="Create admin password"
            value={adminPassword}
            onChangeText={setAdminPassword}
            secureTextEntry
            error={errors.adminPassword}
            helper="Password must be at least 8 characters"
            fullWidth
          />
          
          <Input
            label="Confirm Password"
            placeholder="Confirm admin password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={errors.confirmPassword}
            fullWidth
          />
          
          <Button
            title="Create Community"
            variant="primary"
            size="lg"
            onPress={handleCreateCommunity}
            isLoading={isLoading}
            fullWidth
            style={styles.button}
          />
        </View>
      </ScrollView>
      
      {isLoading && <LoadingSpinner fullScreen text="Creating community..." />}
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
  planInfo: {
    backgroundColor: Colors.primary[50],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginVertical: Layout.spacing.md,
  },
  planInfoText: {
    fontSize: 14,
    color: Colors.primary[700],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  button: {
    marginTop: Layout.spacing.lg,
  },
  successContainer: {
    flex: 1,
    padding: Layout.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.success.main,
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: Colors.neutral[700],
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
  },
  hoaCodeContainer: {
    backgroundColor: Colors.primary[50],
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    width: '100%',
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  hoaCodeLabel: {
    fontSize: 14,
    color: Colors.neutral[700],
    marginBottom: Layout.spacing.sm,
  },
  hoaCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary[700],
    marginBottom: Layout.spacing.md,
  },
  hoaCodeInfo: {
    fontSize: 12,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  continueButton: {
    marginTop: Layout.spacing.lg,
  },
});