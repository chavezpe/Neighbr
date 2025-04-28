import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated
} from 'react-native';
import { router } from 'expo-router';
import { Bell, FileText, MessageSquare, Users, Calendar } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Header from '@/components/Header';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

// Hide the default header from Expo Router
export const options = {
  headerShown: false,
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [communityName, setCommunityName] = useState('Your Community');
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New document added', time: '2h ago' },
    { id: 2, title: 'Community meeting this Thursday', time: '1d ago' },
  ]);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Hide default header
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    // Simulating API call to get community name
    setTimeout(() => {
      setCommunityName('Oakwood Estates HOA');
    }, 1000);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <Header
        showLogo={true}
        communityName={communityName}
        rightComponent={<TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <View style={styles.profileAvatar} />
        </TouchableOpacity>} title={''}      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.heroContainer}>
            <Image
              style={styles.heroImage}
              source= {require('@/assets/images/marble.jpeg')}
              resizeMode="cover"
            />
          </View>

          <View style={styles.cardsContainer}>
            <Text style={styles.sectionTitle}>Quick Access</Text>

            <View style={styles.grid}>
              <TouchableOpacity
                style={styles.gridItem}
                onPress={() => router.push('/(tabs)/documents')}
              >
                <View style={[styles.gridItemIcon, { backgroundColor: Colors.primary[50] }]}>
                  <FileText size={28} color={Colors.primary[500]} />
                </View>
                <Text style={styles.gridItemTitle}>Documents</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.gridItem}
                onPress={() => router.push('/(tabs)/chatbot')}
              >
                <View style={[styles.gridItemIcon, { backgroundColor: Colors.accent[50] }]}>
                  <MessageSquare size={28} color={Colors.accent[500]} />
                </View>
                <Text style={styles.gridItemTitle}>Assistant</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.gridItem}
              >
                <View style={[styles.gridItemIcon, { backgroundColor: Colors.secondary[50] }]}>
                  <Calendar size={28} color={Colors.secondary[500]} />
                </View>
                <Text style={styles.gridItemTitle}>Events</Text>
              </TouchableOpacity>

              {user?.isAdmin ? (
                <TouchableOpacity
                  style={styles.gridItem}
                >
                  <View style={[styles.gridItemIcon, { backgroundColor: Colors.primary[50] }]}>
                    <Users size={28} color={Colors.primary[500]} />
                  </View>
                  <Text style={styles.gridItemTitle}>Members</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.gridItem}
                >
                  <View style={[styles.gridItemIcon, { backgroundColor: Colors.accent[50] }]}>
                    <Bell size={28} color={Colors.accent[500]} />
                  </View>
                  <Text style={styles.gridItemTitle}>Alerts</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.cardsContainer}>
            <Text style={styles.sectionTitle}>Recent Notifications</Text>

            {notifications.map((notification) => (
              <Card key={notification.id} style={styles.notificationCard}>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationIconContainer}>
                    <Bell size={18} color={Colors.primary[500]} />
                  </View>
                  <View style={styles.notificationTextContainer}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>

          {user?.isAdmin && (
            <View style={styles.cardsContainer}>
              <Text style={styles.sectionTitle}>Admin Tools</Text>
              <Card style={styles.adminCard} variant="elevated">
                <Text style={styles.adminCardTitle}>Upload Documents</Text>
                <Text style={styles.adminCardDescription}>
                  Add new policies, guidelines, or meeting minutes for your community
                </Text>
                <TouchableOpacity
                  style={styles.adminCardButton}
                  onPress={() => router.push('/(tabs)/upload')}
                >
                  <Text style={styles.adminCardButtonText}>Upload Now</Text>
                </TouchableOpacity>
              </Card>
            </View>
          )}

          <View style={styles.spacer} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: Colors.primary[100],
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primary[300],
  },
  heroContainer: {
    height: 180,
    marginHorizontal: Layout.spacing.lg,
    marginTop: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  cardsContainer: {
    paddingHorizontal: Layout.spacing.lg,
    marginTop: Layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: Layout.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Layout.spacing.xs,
  },
  gridItem: {
    width: '50%',
    padding: Layout.spacing.xs,
    marginBottom: Layout.spacing.md,
  },
  gridItemIcon: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  gridItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[800],
    textAlign: 'center',
  },
  notificationCard: {
    marginBottom: Layout.spacing.md,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[800],
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  adminCard: {
    backgroundColor: Colors.primary[50],
  },
  adminCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary[700],
    marginBottom: 4,
  },
  adminCardDescription: {
    fontSize: 14,
    color: Colors.neutral[600],
    marginBottom: Layout.spacing.md,
  },
  adminCardButton: {
    backgroundColor: Colors.primary[500],
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Layout.borderRadius.md,
    alignSelf: 'flex-start',
  },
  adminCardButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  spacer: {
  height: 80,
    },
});
