import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextInput, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

// Design System Constants
export const COLORS = {
  // Primary Colors
  primary: '#6366f1',
  primaryLight: '#8b5cf6',
  primaryDark: '#4f46e5',
  
  // Secondary Colors
  secondary: '#8b5cf6',
  secondaryLight: '#a78bfa',
  secondaryDark: '#7c3aed',
  
  // Accent Colors
  accent: '#ec4899',
  accentLight: '#f472b6',
  accentDark: '#db2777',
  
  // Status Colors
  success: '#10b981',
  successLight: '#34d399',
  successDark: '#059669',
  
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  warningDark: '#d97706',
  
  error: '#ef4444',
  errorLight: '#f87171',
  errorDark: '#dc2626',
  
  // Neutral Colors
  background: '#f8fafc',
  backgroundDark: '#f1f5f9',
  surface: '#ffffff',
  surfaceDark: '#f8fafc',
  
  // Text Colors
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',
  textOnDark: '#ffffff',
  textOnPrimary: '#ffffff',
  
  // Border Colors
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  borderDark: '#cbd5e1',
  
  // Social Colors
  like: '#ef4444',
  comment: '#6366f1',
  share: '#10b981',
  
  // Dating Colors
  match: '#10b981',
  pass: '#ef4444',
  superLike: '#3b82f6',
};

export const TYPOGRAPHY = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: -0.15,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  
  // Body Text
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 26,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0,
  },
  
  // Labels
  labelLarge: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0,
  },
  labelMedium: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    letterSpacing: 0,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0,
  },
  
  // Caption
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.4,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Button Component
export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  icon, 
  iconPosition = 'left',
  fullWidth = false,
  loading = false,
  style 
}) => {
  const getButtonStyle = () => {
    let baseStyle = {
      flexDirection: iconPosition === 'right' ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.md,
      ...SHADOWS.small,
    };

    // Size variations
    switch (size) {
      case 'small':
        baseStyle = { ...baseStyle, paddingHorizontal: 12, paddingVertical: 8, minHeight: 32 };
        break;
      case 'large':
        baseStyle = { ...baseStyle, paddingHorizontal: 24, paddingVertical: 16, minHeight: 56 };
        break;
      default:
        baseStyle = { ...baseStyle, paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 };
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyle.backgroundColor = COLORS.surface;
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = COLORS.border;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 2;
        baseStyle.borderColor = COLORS.primary;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.shadowOpacity = 0;
        baseStyle.elevation = 0;
        break;
      case 'danger':
        baseStyle.backgroundColor = COLORS.error;
        break;
      default:
        baseStyle.backgroundColor = COLORS.primary;
    }

    if (disabled) {
      baseStyle.opacity = 0.5;
    }

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    let textStyle = { ...TYPOGRAPHY.labelMedium };

    switch (variant) {
      case 'secondary':
        textStyle.color = COLORS.textPrimary;
        break;
      case 'outline':
        textStyle.color = COLORS.primary;
        break;
      case 'ghost':
        textStyle.color = COLORS.primary;
        break;
      default:
        textStyle.color = COLORS.textOnPrimary;
    }

    return textStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {icon && iconPosition === 'left' && (
        <Icon 
          name={icon} 
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
          color={getTextStyle().color} 
          style={{ marginRight: title ? 8 : 0 }}
        />
      )}
      {title && (
        <Text style={getTextStyle()}>
          {loading ? 'Loading...' : title}
        </Text>
      )}
      {icon && iconPosition === 'right' && (
        <Icon 
          name={icon} 
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
          color={getTextStyle().color} 
          style={{ marginLeft: title ? 8 : 0 }}
        />
      )}
    </TouchableOpacity>
  );
};

// Input Component
export const Input = ({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false, 
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  error,
  helperText,
  icon,
  rightIcon,
  onRightIconPress,
  style,
  disabled = false
}) => {
  return (
    <View style={[styles.inputContainer, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={[
        styles.inputWrapper, 
        error && styles.inputError,
        disabled && styles.inputDisabled
      ]}>
        {icon && (
          <Icon 
            name={icon} 
            size={20} 
            color={COLORS.textSecondary} 
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            multiline && styles.inputMultiline
          ]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Icon name={rightIcon} size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

// Card Component
export const Card = ({ children, style, padding = true, shadow = true }) => {
  return (
    <View style={[
      styles.card,
      shadow && SHADOWS.medium,
      !padding && { padding: 0 },
      style
    ]}>
      {children}
    </View>
  );
};

// Avatar Component
export const Avatar = ({ 
  source, 
  name, 
  size = 'medium', 
  style, 
  onPress,
  showOnlineIndicator = false,
  isOnline = false
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 32;
      case 'large': return 64;
      case 'xlarge': return 80;
      default: return 48;
    }
  };

  const avatarSize = getSize();
  const borderRadius = avatarSize / 2;

  const avatarStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const content = (
    <View style={[avatarStyle, style]}>
      {source ? (
        <Image source={source} style={avatarStyle} />
      ) : (
        <Text style={[
          TYPOGRAPHY.labelMedium,
          { 
            color: COLORS.textOnPrimary,
            fontSize: avatarSize * 0.4 
          }
        ]}>
          {getInitials(name)}
        </Text>
      )}
      {showOnlineIndicator && (
        <View style={[
          styles.onlineIndicator,
          { 
            width: avatarSize * 0.25,
            height: avatarSize * 0.25,
            borderRadius: avatarSize * 0.125,
            bottom: avatarSize * 0.05,
            right: avatarSize * 0.05,
            backgroundColor: isOnline ? COLORS.success : COLORS.textTertiary
          }
        ]} />
      )}
    </View>
  );

  return onPress ? (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      {content}
    </TouchableOpacity>
  ) : content;
};

// Badge Component
export const Badge = ({ 
  text, 
  variant = 'primary', 
  size = 'medium', 
  style 
}) => {
  const getBadgeStyle = () => {
    let baseStyle = {
      paddingHorizontal: size === 'small' ? 6 : 8,
      paddingVertical: size === 'small' ? 2 : 4,
      borderRadius: RADIUS.full,
      alignSelf: 'flex-start',
    };

    switch (variant) {
      case 'success':
        baseStyle.backgroundColor = COLORS.success;
        break;
      case 'warning':
        baseStyle.backgroundColor = COLORS.warning;
        break;
      case 'error':
        baseStyle.backgroundColor = COLORS.error;
        break;
      case 'secondary':
        baseStyle.backgroundColor = COLORS.secondary;
        break;
      default:
        baseStyle.backgroundColor = COLORS.primary;
    }

    return baseStyle;
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      <Text style={[
        size === 'small' ? TYPOGRAPHY.caption : TYPOGRAPHY.labelSmall,
        { color: COLORS.textOnPrimary }
      ]}>
        {text}
      </Text>
    </View>
  );
};

// Divider Component
export const Divider = ({ style, vertical = false, thickness = 1 }) => {
  return (
    <View style={[
      {
        backgroundColor: COLORS.border,
        [vertical ? 'width' : 'height']: thickness,
        [vertical ? 'height' : 'width']: vertical ? '100%' : '100%',
      },
      style
    ]} />
  );
};

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'medium', color = COLORS.primary, style }) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 32;
      default: return 24;
    }
  };

  return (
    <View style={[styles.loadingContainer, style]}>
      <Icon name="refresh" size={getSize()} color={color} />
      <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textSecondary, marginTop: 8 }]}>
        Loading...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Input Styles
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    minHeight: 44,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputDisabled: {
    backgroundColor: COLORS.backgroundDark,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  inputWithLeftIcon: {
    paddingLeft: SPACING.sm,
  },
  inputWithRightIcon: {
    paddingRight: SPACING.sm,
  },
  inputMultiline: {
    paddingTop: SPACING.md,
    textAlignVertical: 'top',
  },
  inputIcon: {
    marginLeft: SPACING.md,
  },
  rightIcon: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  helperText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Card Styles
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },

  // Avatar Styles
  onlineIndicator: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },

  // Loading Styles
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
});
