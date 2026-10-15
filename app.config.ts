import type { ConfigContext, ExpoConfig } from "expo/config";

// Google returns to the iOS app through a URL scheme that is the iOS client ID reversed.
// Derived here so the ID lives only in .env; without it iOS Google sign-in never completes.
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const googleIosUrlScheme = googleIosClientId
  ? `com.googleusercontent.apps.${googleIosClientId.replace(".apps.googleusercontent.com", "")}`
  : null;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? "smart-pet-care-app",
  slug: config.slug ?? "smart-pet-care-app",
  plugins: config.plugins?.map((plugin) =>
    plugin === "@react-native-google-signin/google-signin" && googleIosUrlScheme
      ? [plugin, { iosUrlScheme: googleIosUrlScheme }]
      : plugin
  ),
  android: {
    ...config.android,
    ...(process.env.GOOGLE_SERVICES_JSON
      ? { googleServicesFile: process.env.GOOGLE_SERVICES_JSON }
      : {}),
    // Maps SDK key — distinct from the FCM config in google-services.json. The
    // config plugin writes it to AndroidManifest as com.google.android.geo.API_KEY.
    // Absent, the app still builds and the map renders its unavailable fallback.
    ...(process.env.GOOGLE_MAPS_API_KEY
      ? {
          config: {
            ...config.android?.config,
            googleMaps: { apiKey: process.env.GOOGLE_MAPS_API_KEY },
          },
        }
      : {}),
  },
});
