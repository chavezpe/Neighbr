import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
  showLogo?: boolean;
  communityName?: string;
}

export default function Header({
  title,
  subtitle,
  rightComponent,
  showLogo = false,
  communityName,
}: HeaderProps) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View
        style={[
          styles.container,
          showLogo && { paddingVertical: Layout.spacing.sm }, // smaller padding when logo is shown
        ]}
      >
        <View style={styles.leftContent}>
          {showLogo ? (
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>
                  {communityName ? communityName.charAt(0) : 'N'}
                </Text>
              </View>
              <Text style={styles.communityName}>
                {communityName || 'Neighbr'}
              </Text>
            </View>
          ) : (
            <View>
              {title ? (
                <Text style={styles.title}>{title}</Text>
              ) : null}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          )}
        </View>
        {rightComponent && (
          <View style={styles.rightContent}>
            {rightComponent}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md, // default padding; overridden if showLogo
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  subtitle: {
    fontSize: 14,
    color: Colors.neutral[600],
    marginTop: 2,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  communityName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary[800],
  },
});
