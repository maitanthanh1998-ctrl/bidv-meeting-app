import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { authenticate, saveAuthSession } from '../utils/auth';

const isWeb = Platform.OS === 'web';

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin đăng nhập');
      return;
    }

    setLoading(true);
    
    const isValid = await authenticate(username, password);
    
    if (isValid) {
      await saveAuthSession(rememberMe);
      onLogin();
    } else {
      Alert.alert('Lỗi đăng nhập', 'Tên đăng nhập hoặc mật khẩu không đúng');
    }
    
    setLoading(false);
  };

  return (
    <ImageBackground
      source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/68cba74acc7c0698b2f3cd6c_1758179594182_1036807c.webp' }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.content}>
            <View style={styles.card}>
              <Text style={styles.title}>Đăng nhập</Text>
              <Text style={styles.subtitle}>BIDV Lending Hub</Text>
              
              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              
              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Ghi nhớ đăng nhập</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Text>
              </TouchableOpacity>
            </View>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(0, 107, 104, 0.1)',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    alignItems: isWeb ? 'center' : 'stretch',
  },
  title: {
    fontSize: isWeb ? 28 : FONTS.sizes.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: isWeb ? 16 : FONTS.sizes.lg,
    color: COLORS.accent,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  form: {
    gap: SPACING.lg,
  },
  card: {
    width: isWeb ? 420 : '100%',
    maxWidth: '100%',
    alignSelf: 'center',
    backgroundColor: isWeb ? 'rgba(255,255,255,0.9)' : 'transparent',
    padding: isWeb ? SPACING.xl : 0,
    borderRadius: isWeb ? 12 : 0,
    borderWidth: isWeb ? 1 : 0,
    borderColor: isWeb ? COLORS.gray[300] : 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isWeb ? 0.1 : 0,
    shadowRadius: isWeb ? 8 : 0,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    fontSize: FONTS.sizes.md,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  checkboxChecked: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  checkmark: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loginButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
  },
});