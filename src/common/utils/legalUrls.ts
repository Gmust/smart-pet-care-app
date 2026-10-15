import { Linking } from "react-native";
import Toast from "react-native-toast-message";
import i18next from "i18next";

import { createApiBaseURL } from "@/api/axios";

// The suffixed routes are deterministic; bare /terms and /privacy negotiate on Accept
// and return a PDF to anything that is not a browser.
export const TERMS_URL = createApiBaseURL("/terms.html");
export const PRIVACY_URL = createApiBaseURL("/privacy.html");

// Rejects when no app can handle the URL, or when EXPO_PUBLIC_API_URL is unset and the
// URL is relative.
export const openLegalUrl = (url: string) => {
  Linking.openURL(url).catch(() => {
    Toast.show({ type: "error", text1: i18next.t("common:errors.openLinkFailed") });
  });
};
