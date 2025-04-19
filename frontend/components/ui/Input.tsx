import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: ViewStyle;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  secureTextEntry?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  containerStyle,
  labelStyle,
  inputStyle,
  rightIcon,
  fullWidth = false,
  secureTextEntry = false,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Generate styles based on state
  const containerStyles = [
    styles.container,
    fullWidth && styles.fullWidth,
    containerStyle,
  ];

  const inputContainerStyles = [
    styles.inputContainer,
    isFocused && styles.focused,
    error && styles.error,
    fullWidth && styles.fullWidth,
  ];

  const textInputStyles = [
    styles.input,
    fullWidth && styles.fullWidth,
    inputStyle,
  ];

  const renderPasswordToggle = () => {
    if (!secureTextEntry) return null;

    return (
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <EyeOff size={20} color={Colors.neutral[600]} />
        ) : (
          <Eye size={20} color={Colors.neutral[600]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={containerStyles}>
      {label && (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
      
      <View style={inputContainerStyles}>
        <TextInput
          style={textInputStyles}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={Colors.neutral[500]}
          secureTextEntry={secureTextEntry && !showPassword}
          {...rest}
        />
        
        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
        {secureTextEntry && renderPasswordToggle()}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      {helper && !error && (
        <Text style={styles.helperText}>{helper}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: Colors.neutral[800],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    fontSize: 16,
    color: Colors.neutral[900],
  },
  focused: {
    borderColor: Colors.primary[500],
  },
  error: {
    borderColor: Colors.error.main,
  },
  iconContainer: {
    paddingHorizontal: Layout.spacing.md,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error.main,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: Colors.neutral[600],
    marginTop: 4,
  },
  fullWidth: {
    width: '100%',
  },
});

export default Input;