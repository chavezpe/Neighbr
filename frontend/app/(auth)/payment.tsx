import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { initStripe, useStripe } from '@stripe/stripe-react-native';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { STRIPE_PUBLISHABLE_KEY, SUBSCRIPTION_PLANS } from '@/constants/Config';

export default function Payment() {
  const { plan, households } = useLocalSearchParams<{ plan: string; households: string }>();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === plan) || SUBSCRIPTION_PLANS[0];

  useEffect(() => {
    // Initialize Stripe
    initStripe({ publishableKey: STRIPE_PUBLISHABLE_KEY }).then(() => {
      setIsInitialized(true);
    });
  }, []);

  const handleInitiatePayment = async () => {
    setIsLoading(true);
    
    try {
      // For demo purposes, we'll simulate payment success
      // In a real app, you would:
      // 1. Call API to create payment intent
      // 2. Initialize payment sheet with client secret
      // 3. Present payment sheet
      // 4. Handle payment result
      
      // Simulate API call and payment success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to community details page
      router.push({
        pathname: '/(auth)/community-details',
        params: { households: households || '25' }
      });
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.neutral[800]} />
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>Payment</Text>
          <Text style={styles.subtitle}>Complete your subscription</Text>
        </View>
        
        <View style={styles.planSummary}>
          <Text style={styles.planSummaryTitle}>Plan Summary</Text>
          
          <View style={styles.planDetails}>
            <Text style={styles.planName}>{selectedPlan.name}</Text>
            <Text style={styles.planPrice}>${selectedPlan.price}/month</Text>
          </View>
          
          <View style={styles.planFeatures}>
            {selectedPlan.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Check size={18} color={Colors.success.main} style={styles.checkIcon} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.paymentForm}>
          <Text style={styles.formTitle}>Payment Information</Text>
          
          <Input
            label="Card Number"
            placeholder="1234 5678 9012 3456"
            keyboardType="number-pad"
            fullWidth
          />
          
          <View style={styles.cardDetails}>
            <View style={styles.expiryContainer}>
              <Input
                label="Expiry Date"
                placeholder="MM/YY"
                keyboardType="number-pad"
                fullWidth
              />
            </View>
            
            <View style={styles.cvvContainer}>
              <Input
                label="CVV"
                placeholder="123"
                keyboardType="number-pad"
                fullWidth
              />
            </View>
          </View>
          
          <Input
            label="Name on Card"
            placeholder="John Doe"
            autoCapitalize="words"
            fullWidth
          />
          
          <Input
            label="Billing ZIP Code"
            placeholder="12345"
            keyboardType="number-pad"
            fullWidth
          />
          
          <Button
            title={`Pay $${selectedPlan.price}`}
            variant="primary"
            size="lg"
            onPress={handleInitiatePayment}
            isLoading={isLoading}
            fullWidth
            style={styles.payButton}
          />
          
          <Text style={styles.securePaymentText}>
            Payments are securely processed. You won't be charged until your community is created.
          </Text>
        </View>
      </ScrollView>
      
      {isLoading && <LoadingSpinner fullScreen text="Processing payment..." />}
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
  planSummary: {
    backgroundColor: Colors.neutral[50],
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
  planSummaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: Layout.spacing.md,
  },
  planDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    marginBottom: Layout.spacing.md,
  },
  planName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.neutral[800],
  },
  planPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary[500],
  },
  planFeatures: {
    marginTop: Layout.spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  checkIcon: {
    marginRight: Layout.spacing.sm,
  },
  featureText: {
    fontSize: 14,
    color: Colors.neutral[700],
  },
  paymentForm: {
    marginBottom: Layout.spacing.xl,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: Layout.spacing.md,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expiryContainer: {
    flex: 3,
    marginRight: Layout.spacing.md,
  },
  cvvContainer: {
    flex: 2,
  },
  payButton: {
    marginTop: Layout.spacing.lg,
  },
  securePaymentText: {
    fontSize: 12,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginTop: Layout.spacing.md,
  },
});