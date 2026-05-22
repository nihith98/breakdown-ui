import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

const stylesheet = createStyleSheet((theme) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.canvas,
    paddingHorizontal: theme.spacing.lg,
  },
  logo: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.ink,
    marginBottom: theme.spacing.xl,
    fontFamily: theme.typography.displayBold,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.ink,
    marginBottom: theme.spacing.lg,
    fontFamily: theme.typography.displayBold,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 12,
    color: theme.colors.inkMuted,
    fontFamily: theme.typography.body,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  spinner: {
    marginTop: theme.spacing.lg,
  },
}));

export default function SuccessScreen() {
  const router = useRouter();
  const { styles } = useStyles(stylesheet);

  useEffect(() => {
    // Auto-redirect to dashboard after 2-3 seconds
    const timer = setTimeout(() => {
      router.replace('/(tabs)/home');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>breakDown</Text>
      <Text style={styles.successMessage}>Login Successful</Text>
      <Text style={styles.subtext}>Redirecting to dashboard...</Text>
      <ActivityIndicator size="large" color="currentColor" style={styles.spinner} />
    </View>
  );
}
