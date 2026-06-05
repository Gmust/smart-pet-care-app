import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import type { AuthResponse } from "@/api/generated";
import { usePostApiAuthOauthGoogleMobile } from "@/api/generated";
import { Button } from "@/shadecn/ui/button";

import { getProblemMessage } from "../utils/auth-errors";

// The id_token's audience is the Web client ID — this is what the backend
// verifies. The native Android/iOS client is matched automatically by Google
// via package name + SHA-1 (Android) / bundle id (iOS), so it is NOT passed here.
const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

GoogleSignin.configure({
  webClientId,
  iosClientId,
  scopes: ["openid", "profile", "email"],
});

interface GoogleAuthButtonProps {
  onAuthenticated: (response: AuthResponse) => void;
}

export function GoogleAuthButton({ onAuthenticated }: GoogleAuthButtonProps) {
  const { t } = useTranslation(["auth"]);
  const googleMobileMutation = usePostApiAuthOauthGoogleMobile();

  const isConfigured = Boolean(webClientId);

  const handlePress = async () => {
    if (!isConfigured) {
      Toast.show({ type: "info", text1: t("auth:errors.googleUnavailable") });
      return;
    }

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) {
        // User dismissed the account picker.
        return;
      }

      const idToken = response.data.idToken;
      if (!idToken) {
        Toast.show({ type: "error", text1: t("auth:errors.googleFailed") });
        return;
      }

      const result = await googleMobileMutation.mutateAsync({ data: { idToken } });
      onAuthenticated(result.data);
    } catch (error) {
      if (isErrorWithCode(error)) {
        // Cancelled / already in progress are not real errors — stay silent.
        if (
          error.code === statusCodes.SIGN_IN_CANCELLED ||
          error.code === statusCodes.IN_PROGRESS
        ) {
          return;
        }
      }
      Toast.show({ type: "error", text1: getProblemMessage(error, t("auth:errors.googleFailed")) });
    }
  };

  return (
    <Button
      size="lg"
      variant="secondary"
      disabled={googleMobileMutation.isPending}
      isLoading={googleMobileMutation.isPending}
      onPress={handlePress}
    >
      {t("auth:actions.google")}
    </Button>
  );
}
