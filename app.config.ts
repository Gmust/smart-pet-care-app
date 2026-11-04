import type { ConfigContext, ExpoConfig } from "expo/config";

// Google returns to the iOS app through a URL scheme that is the iOS client ID reversed.
// Derived here so the ID lives only in .env; without it iOS Google sign-in never completes.
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const googleIosUrlScheme = googleIosClientId
  ? `com.googleusercontent.apps.${googleIosClientId.replace(".apps.googleusercontent.com", "")}`
  : null;
const GOOGLE_SIGNIN_PLUGIN = "@react-native-google-signin/google-signin";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? "Miso",
  slug: config.slug ?? "miso",
  // app.json may list the plugin bare or as [name, options]; keep any options.
  plugins: config.plugins?.map((plugin) => {
    if (!googleIosUrlScheme) return plugin;
    if (plugin === GOOGLE_SIGNIN_PLUGIN) {
      return [plugin, { iosUrlScheme: googleIosUrlScheme }];
    }
    if (Array.isArray(plugin) && plugin[0] === GOOGLE_SIGNIN_PLUGIN) {
      return [GOOGLE_SIGNIN_PLUGIN, { ...plugin[1], iosUrlScheme: googleIosUrlScheme }];
    }
    return plugin;
  }),
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
