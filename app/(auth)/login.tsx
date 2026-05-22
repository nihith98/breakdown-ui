/**
 * Shared login route file
 * Expo Router automatically selects the platform-specific implementation:
 * - login.ios.tsx for iOS
 * - login.android.tsx for Android
 * - login.web.tsx for web
 *
 * This file exports a default component so the router recognizes it.
 * The actual UI is in the platform-specific files.
 */

export { default } from './login.web';
