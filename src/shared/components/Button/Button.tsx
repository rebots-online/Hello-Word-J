import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styled } from 'nativewind';

const StyledButton = styled(TouchableOpacity, 'px-4 py-2 rounded-lg items-center');
const StyledText = styled(Text, 'text-white font-bold');

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary' 
}: ButtonProps) => {
  const variantClasses = {
    primary: 'bg-blue-500',
    secondary: 'bg-gray-500',
  };

  return (
    <StyledButton 
      className={variantClasses[variant]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <StyledText>{title}</StyledText>
    </StyledButton>
  );
};

// Web-specific implementation (will be tree-shaken in native builds)
if (process.env.NODE_ENV === 'web') {
  // @ts-ignore - This is a web-only optimization
  Button.displayName = 'Button';
}
