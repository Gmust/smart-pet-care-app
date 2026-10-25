import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import type { AuthResponse } from "@/api/generated";
import { getApiErrorMessage } from "@/errors/utils/getApiErrorMessage";
import { GoogleIcon } from "@/icons/google";
import { Button } from "@/shadecn/ui/button";

import { useGoogleMobileAuthMutation } from "../queries/useGoogleMobileAuthMutation";

import { GoogleConsentDrawer } from "./GoogleConsentDrawer";

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
  onAuthenticated: (response: AuthResponse) => Promise<void>;
}

export function GoogleAuthButton({ onAuthenticated }: GoogleAuthButtonProps) {
  const { t } = useTranslation(["auth"]);
  const googleMobileMutation = useGoogleMobileAuthMutation();
  const [consentOpen, setConsentOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const agreedRef = useRef(false);

  const isConfigured = Boolean(webClientId);
  const isBusy = isSigningIn || googleMobileMutation.isPending;

  const signInWithGoogle = async () => {
    if (!isConfigured) {
      Toast.show({ type: "info", text1: t("auth:errors.googleUnavailable") });
      return;
    }

    setIsSigningIn(true);
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

      const result = await googleMobileMutation.mutateAsync({ idToken });
      await onAuthenticated(result);
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
      Toast.show({
        type: "error",
        text1: getApiErrorMessage(error, t("auth:errors.googleFailed")),
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <>
      <Button
        variant="neutral"
        icon={<GoogleIcon />}
        disabled={isBusy}
        isLoading={isBusy}
        onPress={() => setConsentOpen(true)}
      >
        {t("auth:actions.google")}
      </Button>

      <GoogleConsentDrawer
        open={consentOpen}
        onOpenChange={setConsentOpen}
        onAgree={() => {
          agreedRef.current = true;
        }}
        // Google's account picker is a native Activity: starting it while the sheet is still
        // closing would trip the drawer's native-activity recovery, so wait for the dismiss.
        onDismiss={() => {
          if (!agreedRef.current) return;
          agreedRef.current = false;
          signInWithGoogle();
        }}
      />
    </>
  );
}
