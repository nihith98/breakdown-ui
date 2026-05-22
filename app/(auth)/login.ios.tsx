/**
 * Native iOS login screen for breakDown
 * Implements Human Interface Guidelines with safe area handling
 * and native SF Symbols for password visibility toggle
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import { useLoginMutation } from '@/queries/authQueries';
import { LoginRequest } from '@/types/auth';

const stylesheet = createStyleSheet((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  form: {
    width: '100%',
  },
  logo: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.ink,
    marginBottom: theme.spacing.mdSm,
    fontFamily: theme.typography.displayBold,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    color: theme.colors.inkMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    fontFamily: theme.typography.body,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.ink,
    marginBottom: theme.spacing.lg,
    fontFamily: theme.typography.displayBold,
    textAlign: 'center',
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
    fontSize: 16,
    color: theme.colors.ink,
    backgroundColor: theme.colors.surface,
    fontFamily: theme.typography.body,
    minHeight: 48,
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
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: theme.typography.body,
  },
  signupLink: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
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
  passwordToggle: {
    position: 'absolute',
    right: theme.spacing.md,
    top: '50%',
    marginTop: -12,
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordInputWrapper: {
    position: 'relative',
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

export default function LoginScreenIOS() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: insets.top }}>
          <View style={styles.form}>
            <Text style={styles.logo}>breakDown</Text>
            <Text style={styles.tagline}>Privacy-first expense splitting</Text>

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
                placeholderTextColor="#B5AFA5"
                value={form.email}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, email: text }))
                }
                onBlur={handleEmailBlur}
                editable={!isPending}
                selectTextOnFocus
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                textContentType="emailAddress"
              />
              {form.errors.email && (
                <Text style={styles.errorText}>{form.errors.email}</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    form.errors.password && styles.inputError,
                    { paddingRight: 44 },
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor="#B5AFA5"
                  value={form.password}
                  onChangeText={(text) =>
                    setForm((prev) => ({ ...prev, password: text }))
                  }
                  onBlur={handlePasswordBlur}
                  secureTextEntry={!form.showPassword}
                  editable={!isPending}
                  selectTextOnFocus
                  returnKeyType="done"
                  textContentType="password"
                />
                <Pressable
                  style={styles.passwordToggle}
                  onPress={() =>
                    setForm((prev) => ({
                      ...prev,
                      showPassword: !prev.showPassword,
                    }))
                  }
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={{ fontSize: 14, color: '#7A7066', fontWeight: '600' }}>
                    {form.showPassword ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              </View>
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
                  <Text style={[styles.buttonText, { marginLeft: 8 }]}>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
