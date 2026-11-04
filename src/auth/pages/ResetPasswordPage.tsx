import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Toast from "react-native-toast-message";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getApiError } from "@/errors/utils/getApiError";
import { getApiErrorMessage } from "@/errors/utils/getApiErrorMessage";
import { setApiFieldErrors } from "@/errors/utils/setApiFieldErrors";
import { Button } from "@/shadecn/ui/button";

import { AuthBackground } from "../components/AuthBackground";
import { AuthField } from "../components/AuthField";
import { AuthHeader } from "../components/AuthHeader";
import { useAuth } from "../hooks/useAuth";
import { useResetPasswordMutation } from "../queries/useResetPasswordMutation";
import { resetPasswordRouteParamsSchema, resetPasswordSchema } from "../schemas/auth.schema";

// The way in is the emailed https://<api>/reset-password?token=… as a verified Android App Link.
// The API's browser fallback never hands the token to miso:// (KAN-93), so a miso:// URL reaching
// this screen did not come from the reset email. Only the submit can tell a live token from a dead
// one.
export default function ResetPasswordPage() {
  const { t } = useTranslation(["auth"]);
  const { theme } = useUnistyles();
  const router = useRouter();
  const params = resetPasswordRouteParamsSchema.safeParse(useLocalSearchParams());
  const { status } = useAuth();

  const { mutateAsync: resetPassword } = useResetPasswordMutation();

  const schema = useMemo(() => resetPasswordSchema(t), [t]);
  const token = params.success ? params.data.token : null;

  const form = useForm({
    defaultValues: { password: "", passwordConfirm: "" },
    validators: { onChange: schema, onSubmit: schema },
    onSubmit: async ({ value }) => {
      // Without a token the form is not rendered. While the session is loading, where to go
      // afterwards is unknown: sign-in would land on top of a session that is about to be live.
      if (!token || status === "loading") return;

      try {
        await resetPassword({
          token,
          password: value.password,
          passwordConfirm: value.passwordConfirm,
        });
      } catch (error) {
        const { code } = getApiError(error);
        // A spent, superseded or expired link cannot be fixed here: the next step is a new one.
        if (code === "auth_reset_token_invalid" || code === "auth_reset_token_expired") {
          Toast.show({ type: "error", text1: getApiErrorMessage(error) });
          router.replace("/(auth)/forgot-password");
          return;
        }
        setApiFieldErrors(form, error);
        Toast.show({ type: "error", text1: getApiErrorMessage(error) });
        return;
      }

      // No session comes back. Do not sign out here: the link may belong to another account, and
      // if it was this one, its revoked refresh token signs the device out on the next refresh.
      Toast.show({
        type: "success",
        text1: t("auth:success.passwordResetTitle"),
        text2: status === "authenticated" ? undefined : t("auth:success.passwordResetBody"),
      });
      // dismissTo, not replace("/"): with the app already open, index's Redirect would mount a
      // second (tabs) on top of the existing one.
      router.dismissTo(status === "authenticated" ? "/(tabs)/home" : "/(auth)/sign-in");
    },
  });

  return (
    <AuthBackground hero>
      <KeyboardAwareScrollView
        bottomOffset={theme.spacing(6)}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {token ? (
          <>
            <AuthHeader
              title={t("auth:resetPassword.title")}
              subtitle={t("auth:resetPassword.subtitle")}
            />

            <View style={styles.form}>
              <View style={styles.fields}>
                <form.Field name="password">
                  {(field) => (
                    <AuthField
                      field={field}
                      secure
                      label={t("auth:fields.newPassword")}
                      placeholder={t("auth:fields.newPasswordPlaceholder")}
                      hint={t("auth:fields.passwordHint")}
                      autoCapitalize="none"
                      autoComplete="new-password"
                      textContentType="newPassword"
                    />
                  )}
                </form.Field>
                <form.Field name="passwordConfirm">
                  {(field) => (
                    <AuthField
                      field={field}
                      secure
                      label={t("auth:fields.passwordConfirm")}
                      placeholder={t("auth:fields.passwordConfirmPlaceholder")}
                      autoCapitalize="none"
                      autoComplete="new-password"
                      textContentType="newPassword"
                    />
                  )}
                </form.Field>
              </View>

              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <Button
                    variant="primary"
                    disabled={isSubmitting || status === "loading"}
                    isLoading={isSubmitting}
                    onPress={() => form.handleSubmit()}
                  >
                    {t("auth:resetPassword.submit")}
                  </Button>
                )}
              </form.Subscribe>
            </View>
          </>
        ) : (
          <>
            <AuthHeader
              title={t("auth:resetPassword.linkMissingTitle")}
              subtitle={t("auth:resetPassword.linkMissingBody")}
            />
            <Button variant="primary" onPress={() => router.replace("/(auth)/forgot-password")}>
              {t("auth:resetPassword.requestNewLink")}
            </Button>
          </>
        )}
      </KeyboardAwareScrollView>

      {/* Never toward sign-in over a live session, nor while it is still loading. */}
      {status === "unauthenticated" && (
        <View style={styles.footer}>
          <Button variant="text" size="inline" onPress={() => router.dismissTo("/(auth)/sign-in")}>
            {t("auth:resetPassword.backToSignIn")}
          </Button>
        </View>
      )}
    </AuthBackground>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing(8),
    paddingHorizontal: theme.spacing(5),
    paddingTop: theme.spacing(39.5),
    paddingBottom: theme.spacing(5),
  },
  form: {
    gap: theme.spacing(8),
  },
  fields: {
    gap: theme.spacing(4),
  },
  footer: {
    alignItems: "center",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(5),
  },
}));
