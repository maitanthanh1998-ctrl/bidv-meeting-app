import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, StyleSheet, Dimensions, Platform } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/68cb713307dfedb35c9c650e_1758179519255_5ba7a3a3.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>BIDV Lending Hub</Text>
        <Text style={styles.subtitle}>ỨNG DỤNG ĐẶT LỊCH PHÒNG HỌP</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: isWeb ? 180 : 120,
    height: isWeb ? 180 : 120,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: isWeb ? 48 : FONTS.sizes.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: isWeb ? 22 : FONTS.sizes.lg,
    color: COLORS.accent,
    textAlign: 'center',
  },
});