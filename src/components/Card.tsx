import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../theme/theme';

interface CardProps extends ViewProps {
  style?: ViewStyle;
  variant?: 'default' | 'glass' | 'elevated';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  ...props
}) => {
  const renderContent = () => (
    <View style={[styles.container, getVariantStyle(), style]} {...props}>
      {children}
    </View>
  );

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'glass':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
        };
      case 'elevated':
        return {
          backgroundColor: COLORS.surface,
          ...SHADOWS.large,
        };
      default:
        return {
          backgroundColor: COLORS.card,
          ...SHADOWS.medium,
        };
    }
  };

  if (variant === 'glass') {
    return (
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {renderContent()}
      </LinearGradient>
    );
  }

  return renderContent();
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
});

export default Card; 