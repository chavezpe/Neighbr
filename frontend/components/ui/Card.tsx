import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  elevation?: number;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style,
  elevation = 1,
}) => {
  const cardStyle = [
    styles.card,
    getElevationStyle(elevation),
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

// Function to get elevation style
const getElevationStyle = (elevation: number): ViewStyle => {
  switch (elevation) {
    case 0:
      return styles.elevation0;
    case 1:
      return styles.elevation1;
    case 2:
      return styles.elevation2;
    case 3:
      return styles.elevation3;
    default:
      return styles.elevation1;
  }
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginVertical: Layout.spacing.sm,
  },
  elevation0: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  elevation1: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  elevation2: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  elevation3: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
});

export default Card;