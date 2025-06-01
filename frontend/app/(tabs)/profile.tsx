import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated, Modal } from 'react-native';
import { LogOut, Settings, CircleHelp as HelpCircle, Shield, CircleUser as UserCircle, Chrome as Home, Lock } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import axios from 'axios';
import { API_URL } from '@/constants/Config';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
              leftIcon={<Settings size={16} color={Colors.primary[500]} />}
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
              icon={<Lock size={22} color={Colors.neutral[700]} />}
              title="Change Password"
              subtitle="Update your password"
              onPress={() => setShowPasswordModal(true)}
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
            leftIcon={<LogOut size={18} color={Colors.error.main} />}
          />

          <View style={styles.footer}>
            <Text style={styles.appInfo}>Neighbr HOA Assistant</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>
        </ScrollView>

        <ChangePasswordModal
          visible={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      </Animated.View>
    </View>
  );
}

function MenuItem({ icon, title, subtitle, onPress }: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.menuItemIcon}>{icon}</View>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

function ChangePasswordModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('current_password', currentPassword);
      formData.append('new_password', newPassword);

      await axios.post(`${API_URL}/auth/update-password`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Success', 'Password updated successfully');
      onClose();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password update failed:', error);
      Alert.alert('Error', 'Failed to update password. Please check your current password and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Change Password</Text>
          
          <Input
            label="Current Password"
            placeholder="Enter current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            fullWidth
          />

          <Input
            label="New Password"
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            fullWidth
            helper="Password must be at least 8 characters"
          />

          <Input
            label="Confirm New Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            fullWidth
          />

          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              variant="outline"
              size="md"
              onPress={onClose}
              style={styles.modalButton}
            />
            <Button
              title="Update Password"
              variant="primary"
              size="md"
              onPress={handleSubmit}
              isLoading={isLoading}
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
    marginTop: Layout.spacing.xxl,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Layout.spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.neutral[900],
    marginBottom: Layout.spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Layout.spacing.lg,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: Layout.spacing.xs,
  },
});