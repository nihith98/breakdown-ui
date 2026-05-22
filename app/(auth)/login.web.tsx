/**
 * Web login screen for breakDown
 * Responsive design with hero section on desktop, stacked on mobile
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import { useLoginMutation } from '@/queries/authQueries';
import { LoginRequest } from '@/types/auth';

const stylesheet = createStyleSheet((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  contentWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  mobileContainer: {
    flexDirection: 'column',
  },
  desktopHeroSection: {
    width: '40%',
    backgroundColor: theme.colors.surfaceRaised,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  desktopFormSection: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  logo: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.ink,
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.displayBold,
  },
  tagline: {
    fontSize: 14,
    color: theme.colors.inkMuted,
    textAlign: 'center',
    fontFamily: theme.typography.body,
  },
  form: {
    width: '100%',
    maxWidth: 350,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.ink,
    marginBottom: theme.spacing.lg,
    fontFamily: theme.typography.displayBold,
  },
  fieldGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.ink,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: theme.typography.body,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.mdSm,
    fontSize: 14,
    color: theme.colors.ink,
    backgroundColor: theme.colors.surface,
    fontFamily: theme.typography.body,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: theme.spacing.sm,
    fontFamily: theme.typography.body,
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.mdSm,
    marginBottom: theme.spacing.lg,
  },
  errorBannerText: {
    color: '#ef4444',
    fontSize: 14,
    fontFamily: theme.typography.body,
  },
  button: {
    backgroundColor: theme.colors.amber,
    paddingVertical: theme.spacing.mdSm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: theme.typography.body,
  },
  buttonTextLoading: {
    marginLeft: theme.spacing.sm,
  },
  signupLink: {
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  signupLinkText: {
    fontSize: 14,
    color: theme.colors.inkMuted,
    fontFamily: theme.typography.body,
  },
  signupLinkAction: {
    color: theme.colors.amber,
    fontWeight: '600',
  },
}));

interface FormState {
  email: string;
  password: string;
  showPassword: boolean;
  errors: {
    email?: string;
    password?: string;
  };
}

export default function LoginScreenWeb() {
  const router = useRouter();
  const { styles } = useStyles(stylesheet);
  const { mutate: login, isPending, error } = useLoginMutation();

  const [form, setForm] = useState<FormState>({
    email: '',
    password: '',
    showPassword: false,
    errors: {},
  });

  const validateForm = (): boolean => {
    const errors: FormState['errors'] = {};

    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!form.password.trim()) {
      errors.password = 'Password is required';
    }

    setForm((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const credentials: LoginRequest = {
      email: form.email.trim(),
      password: form.password,
    };

    login(credentials, {
      onSuccess: () => {
        router.replace('/dashboard');
      },
    });
  };

  const handleEmailBlur = () => {
    const errors = { ...form.errors };
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Please enter a valid email address';
    } else {
      delete errors.email;
    }
    setForm((prev) => ({ ...prev, errors }));
  };

  const handlePasswordBlur = () => {
    const errors = { ...form.errors };
    if (!form.password.trim()) {
      errors.password = 'Password is required';
    } else {
      delete errors.password;
    }
    setForm((prev) => ({ ...prev, errors }));
  };

  const isFormValid =
    form.email.trim().length > 0 &&
    form.password.trim().length > 0 &&
    !isPending &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.contentWrapper, styles.mobileContainer]}>
        <View style={styles.desktopHeroSection}>
          <Text style={styles.logo}>breakDown</Text>
          <Text style={styles.tagline}>Privacy-first expense splitting</Text>
        </View>

        <View style={styles.desktopFormSection}>
          <View style={styles.form}>
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>
                  {error instanceof Error ? error.message : 'Login failed. Please try again.'}
                </Text>
              </View>
            )}

            <Text style={styles.formTitle}>Log In</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  form.errors.email && styles.inputError,
                ]}
                placeholder="Enter your email"
                placeholderTextColor="#7A7066"
                value={form.email}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, email: text }))
                }
                onBlur={handleEmailBlur}
                editable={!isPending}
                selectTextOnFocus
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {form.errors.email && (
                <Text style={styles.errorText}>{form.errors.email}</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  form.errors.password && styles.inputError,
                ]}
                placeholder="Enter your password"
                placeholderTextColor="#7A7066"
                value={form.password}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, password: text }))
                }
                onBlur={handlePasswordBlur}
                secureTextEntry={!form.showPassword}
                editable={!isPending}
                selectTextOnFocus
              />
              {form.errors.password && (
                <Text style={styles.errorText}>{form.errors.password}</Text>
              )}
            </View>

            <Pressable
              style={[styles.button, !isFormValid && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!isFormValid}
            >
              {isPending ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={[styles.buttonText, styles.buttonTextLoading]}>
                    LOGGING IN...
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>LOG IN</Text>
              )}
            </Pressable>

            <View style={styles.signupLink}>
              <Text style={styles.signupLinkText}>
                Don't have an account?{' '}
                <Text style={styles.signupLinkAction}>Sign up</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
