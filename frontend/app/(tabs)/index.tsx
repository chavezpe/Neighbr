import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, FileText, MessageSquare, Users } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

export default function HomeScreen() {
  const { user } = useAuth();
  const [communityName, setCommunityName] = useState('Your Community');
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New document added', time: '2h ago' },
    { id: 2, title: 'Community meeting this Thursday', time: '1d ago' },
  ]);

  // In a real app, you would fetch the community name from the API
  useEffect(() => {
    // Simulating API call to get community name
    setTimeout(() => {
      setCommunityName('Sunset Heights HOA');
    }, 1000);
  }, []);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome{user?.isAdmin ? ', Admin' : ''}
          </Text>
          <Text style={styles.communityName}>{communityName}</Text>
        </View>

        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/3847500/pexels-photo-3847500.jpeg' }}
            style={styles.heroImage}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Have a Question?</Text>
            <Text style={styles.heroSubtitle}>Ask our policy assistant</Text>
            <TouchableOpacity 
              style={styles.heroButton}
              onPress={() => router.push('/(tabs)/chatbot')}
            >
              <Text style={styles.heroButtonText}>Chat Now</Text>
              <MessageSquare size={16} color={Colors.white} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.quickLinks}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.linkGrid}>
            <QuickLinkItem 
              icon={<FileText size={24} color={Colors.primary[500]} />}
              title="Documents"
              onPress={() => router.push('/(tabs)/documents')}
            />
            <QuickLinkItem 
              icon={<MessageSquare size={24} color={Colors.accent[500]} />}
              title="Assistant"
              onPress={() => router.push('/(tabs)/chatbot')}
            />
            {user?.isAdmin ? (
              <QuickLinkItem 
                icon={<Users size={24} color={Colors.secondary[500]} />}
                title="Members"
                onPress={() => {}}
              />
            ) : (
              <QuickLinkItem 
                icon={<Bell size={24} color={Colors.secondary[500]} />}
                title="Notifications"
                onPress={() => {}}
              />
            )}
          </View>
        </View>

        <View style={styles.notificationsSection}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          {notifications.map((notification) => (
            <Card key={notification.id} style={styles.notificationCard}>
              <View style={styles.notificationContent}>
                <Bell size={18} color={Colors.primary[500]} style={styles.notificationIcon} />
                <View style={styles.notificationTextContainer}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {user?.isAdmin && (
          <View style={styles.adminSection}>
            <Text style={styles.sectionTitle}>Admin Tools</Text>
            <Card style={styles.adminCard}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickLinkItem({ icon, title, onPress }: { 
  icon: React.ReactNode; 
  title: string; 
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickLinkItem} onPress={onPress}>
      <View style={styles.quickLinkIconContainer}>{icon}</View>
      <Text style={styles.quickLinkTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    backgroundColor: Colors.primary[500],
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.primary[100],
    marginBottom: 2,
  },
  communityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  heroContainer: {
    position: 'relative',
    height: 180,
    margin: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
    marginTop: -Layout.spacing.md,
  },
  heroImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  heroContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: Layout.spacing.lg,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.white,
    marginBottom: Layout.spacing.md,
  },
  heroButton: {
    backgroundColor: Colors.primary[500],
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Layout.borderRadius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
  },
  quickLinks: {
    marginVertical: Layout.spacing.lg,
  },
  linkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Layout.spacing.md,
  },
  quickLinkItem: {
    width: '33%',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  quickLinkIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickLinkTitle: {
    fontSize: 14,
    color: Colors.neutral[700],
    textAlign: 'center',
  },
  notificationsSection: {
    marginBottom: Layout.spacing.lg,
  },
  notificationCard: {
    marginHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
    padding: Layout.spacing.md,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
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
  adminSection: {
    marginBottom: Layout.spacing.xl,
  },
  adminCard: {
    marginHorizontal: Layout.spacing.lg,
    padding: Layout.spacing.lg,
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
});