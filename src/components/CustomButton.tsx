import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, GestureResponderEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../theme/theme';

interface CustomButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  disabled = false,
}) => {
  const getGradientColors = (): [string, string] => {
    switch (variant) {
      case 'primary':
        return [COLORS.primary, '#8B85FF'];
      case 'secondary':
        return [COLORS.secondary, '#50E050'];
      default:
        return ['transparent', 'transparent'];
    }
  };

  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      ...styles.button
    };

    switch (size) {
      case 'small':
        baseStyle.paddingVertical = SIZES.xs;
        baseStyle.paddingHorizontal = SIZES.md;
        break;
      case 'large':
        baseStyle.paddingVertical = SIZES.lg;
        baseStyle.paddingHorizontal = SIZES.xxl;
        break;
      default:
        baseStyle.paddingVertical = SIZES.sm;
        baseStyle.paddingHorizontal = SIZES.xl;
    }

    if (variant === 'outline') {
      baseStyle.borderWidth = 2;
      baseStyle.borderColor = COLORS.primary;
    }

    if (disabled) {
      baseStyle.opacity = 0.5;
    }

    return baseStyle;
  };

  const buttonContent = (
    <Text
      style={[
        styles.text,
        variant === 'outline' && { color: COLORS.primary },
        textStyle,
      ]}
    >
      {title}
    </Text>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[getButtonStyle(), style]}
    >
      {variant === 'outline' ? (
        buttonContent
      ) : (
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {buttonContent}
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.md,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: COLORS.text,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
});

export default CustomButton; 