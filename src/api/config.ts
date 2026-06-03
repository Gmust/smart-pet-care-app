import axios from "axios";

// Expo inlines EXPO_PUBLIC_* env vars at build time. Set in your .env (see .env.example).
const baseURL = process.env.EXPO_PUBLIC_API_URL;

if (!baseURL) {
  console.warn(
    "EXPO_PUBLIC_API_URL is not set — API requests will use relative URLs and fail. Set it in .env."
  );
}

// The generated client (src/api/generated) calls the global axios instance with
// relative paths like `/api/reminders`, so configuring the default baseURL here
// applies to every request.
axios.defaults.baseURL = baseURL;
