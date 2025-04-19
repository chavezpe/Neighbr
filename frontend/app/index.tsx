import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Index() {
  const { isAuthenticated, isLoading, refreshSession } = useAuth();

  useEffect(() => {
    refreshSession();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner fullScreen text="Loading Neighbr..." />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});