import React, { ReactNode } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  fullWidth?: boolean;
}

export default function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputContainerStyle,
  fullWidth = false,
  ...props
}: InputProps) {
  return (
    <View
      style={[
        styles.container,
        fullWidth ? styles.fullWidth : undefined,
        containerStyle,
      ]}
    >
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          leftIcon ? styles.withLeftIcon : undefined,
          rightIcon ? styles.withRightIcon : undefined,
          error ? styles.inputError : undefined,
          inputContainerStyle,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            rightIcon ? styles.inputWithRightIcon : undefined,
          ]}
          placeholderTextColor={Colors.neutral[400]}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.md,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[800],
    marginBottom: Layout.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
  },
  withLeftIcon: {
    paddingLeft: 0,
  },
  withRightIcon: {
    paddingRight: 0,
  },
  input: {
    flex: 1,
    height: 46,
    paddingHorizontal: Layout.spacing.md,
    fontSize: 16,
    color: Colors.neutral[900],
  },
  inputWithLeftIcon: {
    paddingLeft: Layout.spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: Layout.spacing.xs,
  },
  leftIcon: {
    paddingHorizontal: Layout.spacing.md,
  },
  rightIcon: {
    paddingHorizontal: Layout.spacing.md,
  },
  inputError: {
    borderColor: Colors.error.main,
  },
  errorText: {
    color: Colors.error.main,
    fontSize: 12,
    marginTop: Layout.spacing.xs,
  },
});
