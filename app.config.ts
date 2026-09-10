import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? "smart-pet-care-app",
  slug: config.slug ?? "smart-pet-care-app",
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
