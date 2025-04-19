import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { SUBSCRIPTION_PLANS } from '@/constants/Config';

export default function CreateCommunity() {
  const handleSelectPlan = (plan: typeof SUBSCRIPTION_PLANS[0]) => {
    router.push({
      pathname: '/(auth)/payment',
      params: { plan: plan.id, households: plan.households.toString() }
    });
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
          <Text style={styles.title}>Create Your Community</Text>
          <Text style={styles.subtitle}>Choose a plan that fits your community size</Text>
        </View>
        
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1546168/pexels-photo-1546168.jpeg' }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.plansContainer}>
          {SUBSCRIPTION_PLANS.map((plan, index) => (
            <Card key={plan.id} style={styles.planCard}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>${plan.price}<Text style={styles.perMonth}>/month</Text></Text>
              
              <View style={styles.planFeatures}>
                {plan.features.map((feature, fIndex) => (
                  <Text key={fIndex} style={styles.planFeature}>• {feature}</Text>
                ))}
              </View>
              
              <Button
                title="Select Plan"
                variant={index === 1 ? 'primary' : 'outline'}
                size="md"
                fullWidth
                style={styles.selectButton}
                onPress={() => handleSelectPlan(plan)}
              />
            </Card>
          ))}
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an HOA code? <Text style={styles.signupLink} onPress={() => router.push('/(auth)/signup')}>Sign up here</Text>
          </Text>
        </View>
      </ScrollView>
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
    marginBottom: Layout.spacing.lg,
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
  imageContainer: {
    height: 200,
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: Layout.spacing.xl,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  plansContainer: {
    marginBottom: Layout.spacing.xl,
  },
  planCard: {
    marginBottom: Layout.spacing.lg,
    padding: Layout.spacing.lg,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral[900],
    marginBottom: Layout.spacing.sm,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary[500],
    marginBottom: Layout.spacing.md,
  },
  perMonth: {
    fontSize: 16,
    fontWeight: 'normal',
    color: Colors.neutral[500],
  },
  planFeatures: {
    marginBottom: Layout.spacing.lg,
  },
  planFeature: {
    fontSize: 16,
    color: Colors.neutral[700],
    marginBottom: Layout.spacing.sm,
  },
  selectButton: {
    marginTop: Layout.spacing.sm,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: Layout.spacing.lg,
  },
  footerText: {
    fontSize: 14,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  signupLink: {
    color: Colors.primary[500],
    fontWeight: '600',
  },
});