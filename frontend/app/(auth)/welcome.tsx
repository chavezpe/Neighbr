import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

export default function Welcome() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/2079249/pexels-photo-2079249.jpeg' }}
            style={styles.backgroundImage}
          />
          <View style={styles.overlay} />
          <Text style={styles.logo}>Neighbr</Text>
          <Text style={styles.tagline}>Smart Policy Assistant for HOA Communities</Text>
        </View>
        
        <View style={styles.featureContainer}>
          <FeatureItem 
            title="Easy Document Access" 
            description="Access all your HOA documents in one place" 
          />
          <FeatureItem 
            title="AI Policy Assistant" 
            description="Get instant answers to your community policy questions" 
          />
          <FeatureItem 
            title="Community Management" 
            description="Manage your HOA community with ease" 
          />
        </View>
        
        <View style={styles.buttonsContainer}>
          <Button 
            title="Log In" 
            variant="primary" 
            size="lg" 
            fullWidth 
            style={styles.button} 
            onPress={() => router.push('/(auth)/login-screen')}
          />
          <Button 
            title="Sign Up" 
            variant="outline" 
            size="lg" 
            fullWidth 
            style={styles.button} 
            onPress={() => router.push('/(auth)/signup')}
          />
          <Button 
            title="Create Community" 
            variant="ghost" 
            size="md" 
            style={styles.createButton} 
            onPress={() => router.push('/(auth)/create-community')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
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
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Layout.spacing.xxl,
    marginBottom: Layout.spacing.xl,
    position: 'relative',
    height: 200,
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: Layout.spacing.xl,
  },
  tagline: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    marginTop: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.lg,
  },
  featureContainer: {
    marginVertical: Layout.spacing.lg,
  },
  featureItem: {
    marginBottom: Layout.spacing.md,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary[500],
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 16,
    color: Colors.neutral[700],
  },
  buttonsContainer: {
    marginTop: 'auto',
  },
  button: {
    marginBottom: Layout.spacing.md,
  },
  createButton: {
    alignSelf: 'center',
    marginTop: Layout.spacing.sm,
  },
});