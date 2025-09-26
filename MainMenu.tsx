import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ImageBackground } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { clearAuthSession } from '../utils/auth';

interface MainMenuProps {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

const menuItems = [
  {
    id: 'create',
    title: 'Đặt lịch họp',
    icon: 'https://d64gsuwffb70l.cloudfront.net/68cba74acc7c0698b2f3cd6c_1758177157343_761ccb33.webp',
    color: COLORS.primary,
  },
  {
    id: 'current',
    title: 'Xem lịch hiện tại',
    icon: 'https://d64gsuwffb70l.cloudfront.net/68cba74acc7c0698b2f3cd6c_1758177159055_5beb4fd4.webp',
    color: COLORS.accent,
  },
  {
    id: 'past',
    title: 'Xem lịch quá khứ',
    icon: 'https://d64gsuwffb70l.cloudfront.net/68cba74acc7c0698b2f3cd6c_1758177160825_d824a68f.webp',
    color: COLORS.warning,
  },
];

export default function MainMenu({ onNavigate, onLogout }: MainMenuProps) {
  const handleItemPress = async (itemId: string) => {
    // No logout path in shared-user mode
    onNavigate(itemId);
  };

  return (
    <ImageBackground
      source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/68cba74acc7c0698b2f3cd6c_1758179594182_1036807c.webp' }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>BIDV Lending Hub</Text>
            <Text style={styles.subtitle}>Quản lý lịch họp</Text>
          </View>
          
          <View style={styles.grid}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, { borderColor: item.color }]}
                onPress={() => handleItemPress(item.id)}
              >
                <Image source={{ uri: item.icon }} style={styles.icon} />
                <Text style={[styles.itemTitle, { color: item.color }]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 107, 104, 0.05)',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: SPACING.lg,
  },
  header: {
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.sm,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.accent,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'flex-start',
    gap: SPACING.lg,
  },
  menuItem: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: SPACING.md,
  },
  itemTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});