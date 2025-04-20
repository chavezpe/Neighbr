import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Settings, HelpCircle, Shield, UserCircle, Home } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: logout,
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <UserCircle size={60} color={Colors.white} />
            </View>
            {user?.isAdmin && (
              <View style={styles.adminBadge}>
                <Shield size={16} color={Colors.white} />
              </View>
            )}
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.email.split('@')[0] || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
            {user?.isAdmin && (
              <View style={styles.roleChip}>
                <Text style={styles.roleText}>Administrator</Text>
              </View>
            )}
          </View>
          
          <Button
            title="Edit Profile"
            variant="outline"
            size="sm"
            style={styles.editButton}
          />
        </View>
        
        <Text style={styles.sectionTitle}>Account</Text>
        
        <Card style={styles.menuCard}>
          <MenuItem 
            icon={<Home size={22} color={Colors.primary[500]} />}
            title="My Community"
            subtitle={user?.communityId ? 'View community details' : 'Not joined yet'}
          />
          
          <MenuItem 
            icon={<Settings size={22} color={Colors.neutral[700]} />}
            title="Account Settings"
            subtitle="Notifications, preferences"
          />
          
          {user?.isAdmin && (
            <MenuItem 
              icon={<Shield size={22} color={Colors.secondary[500]} />}
              title="Admin Controls"
              subtitle="Manage community settings"
            />
          )}
          
          <MenuItem 
            icon={<HelpCircle size={22} color={Colors.accent[500]} />}
            title="Help & Support"
            subtitle="FAQs, contact support"
          />
        </Card>
        
        <Button
          title="Log Out"
          variant="ghost"
          size="md"
          onPress={handleLogout}
          style={styles.logoutButton}
          textStyle={styles.logoutButtonText}
          fullWidth
        />
        
        <View style={styles.footer}>
          <Text style={styles.appInfo}>Neighbr HOA Assistant</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ 
  icon, 
  title, 
  subtitle, 
  onPress 
}: { 
  icon: React.ReactNode; 
  title: string; 
  subtitle: string; 
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.menuItemIcon}>{icon}</View>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
      </View>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.primary[100],
    marginTop: 2,
  },
  content: {
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xxl,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Layout.spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.secondary[500],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.neutral[600],
    marginBottom: Layout.spacing.sm,
  },
  roleChip: {
    backgroundColor: Colors.secondary[500],
    paddingVertical: 4,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.pill,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.white,
  },
  editButton: {
    paddingHorizontal: Layout.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: Layout.spacing.md,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: Colors.neutral[600],
  },
  logoutButton: {
    marginTop: Layout.spacing.xl,
  },
  logoutButtonText: {
    color: Colors.error.main,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  appInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[700],
    marginBottom: 4,
  },
  version: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
});