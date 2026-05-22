// app/auth/login.android.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import { useLoginMutation } from '@/queries/authQueries';
import { LoginRequest } from '@/types/auth';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const stylesheet = createStyleSheet((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
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
    paddingVertical: theme.spacing.md,
    fontSize: 16,
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
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  errorBannerText: {
    color: '#ef4444',
    fontSize: 14,
    fontFamily: theme.typography.body,
  },
  passwordInputWrapper: {
    position: 'relative',
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
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
    elevation: 0,
  },
  buttonPressed: {
    elevation: 8,
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
    padding: theme.spacing.sm,
  },
}));

interface FormState {
  username: string;
  password: string;
  showPassword: boolean;
  errors: {
    username?: string;
    password?: string;
  };
}

export default function LoginScreenAndroid() {
  const router = useRouter();
  const { styles } = useStyles(stylesheet);
  const { mutate: login, isPending, error } = useLoginMutation();

  const [form, setForm] = useState<FormState>({
    username: '',
    password: '',
    showPassword: false,
    errors: {},
  });

  const [buttonPressed, setButtonPressed] = useState(false);

  const validateForm = (): boolean => {
    const errors: FormState['errors'] = {};

    if (!form.username.trim()) {
      errors.username = 'Username is required';
    } else if (form.username.length < 3 || form.username.length > 50) {
      errors.username = 'Username must be 3-50 characters';
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
      username: form.username.trim(),
      password: form.password,
    };

    login(credentials, {
      onSuccess: () => {
        router.replace('/auth/success');
      },
    });
  };

  const handleUsernameBlur = () => {
    const errors = { ...form.errors };
    if (!form.username.trim()) {
      errors.username = 'Username is required';
    } else if (form.username.length < 3 || form.username.length > 50) {
      errors.username = 'Username must be 3-50 characters';
    } else {
      delete errors.username;
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
    form.username.trim().length >= 3 &&
    form.password.trim().length > 0 &&
    !isPending;

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <Text style={styles.logo}>breakDown</Text>
          <Text style={styles.tagline}>Privacy-first expense splitting</Text>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error.message}</Text>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[
                styles.input,
                form.errors.username && styles.inputError,
              ]}
              placeholder="Enter your username"
              placeholderTextColor="#B5AFA5"
              value={form.username}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, username: text }))
              }
              onBlur={handleUsernameBlur}
              editable={!isPending}
              selectTextOnFocus
              keyboardType="default"
              returnKeyType="next"
            />
            {form.errors.username && (
              <Text style={styles.errorText}>{form.errors.username}</Text>
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
              />
              <Pressable
                style={styles.passwordToggle}
                onPress={() =>
                  setForm((prev) => ({
                    ...prev,
                    showPassword: !prev.showPassword,
                  }))
                }
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons
                  name={form.showPassword ? 'visibility-off' : 'visibility'}
                  size={24}
                  color="#7A7066"
                />
              </Pressable>
            </View>
            {form.errors.password && (
              <Text style={styles.errorText}>{form.errors.password}</Text>
            )}
          </View>

          <Pressable
            style={[
              styles.button,
              !isFormValid && styles.buttonDisabled,
              buttonPressed && styles.buttonPressed,
            ]}
            onPress={handleSubmit}
            onPressIn={() => setButtonPressed(true)}
            onPressOut={() => setButtonPressed(false)}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
