import Constants from 'expo-constants';

/**
 * Single source of truth for the app's own identity (name, version, slug),
 * read from app.json at runtime via Expo's config (exposed through
 * expo-constants). Change app.json once — every screen using these picks
 * it up automatically, instead of a hardcoded string drifting out of sync
 * with the real config (which is exactly what happened before: AboutScreen
 * hardcoded "TumaPesa" and "1.0.0" as separate literals).
 *
 * Falls back to sensible defaults if expoConfig is ever unavailable (can
 * happen in some bare-workflow / web edge cases).
 */
export const APP_NAME = Constants.expoConfig?.name ?? 'TumaPesa';
export const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
export const APP_SLUG = Constants.expoConfig?.slug ?? 'tumapesa';
