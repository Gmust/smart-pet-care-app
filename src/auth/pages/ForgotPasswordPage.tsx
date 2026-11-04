import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Toast from "react-native-toast-message";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getApiErrorMessage } from "@/errors/utils/getApiErrorMessage";
import { setApiFieldErrors } from "@/errors/utils/setApiFieldErrors";
import { MailIcon } from "@/icons/mail";
import { Button } from "@/shadecn/ui/button";

import { AuthBackground } from "../components/AuthBackground";
import { AuthField } from "../components/AuthField";
import { AuthHeader } from "../components/AuthHeader";
import { AuthSwitchRow } from "../components/AuthSwitchRow";
import { useAuth } from "../hooks/useAuth";
import { useForgotPasswordMutation } from "../queries/useForgotPasswordMutation";
import { forgotPasswordRouteParamsSchema, forgotPasswordSchema } from "../schemas/auth.schema";

export default function ForgotPasswordPage() {
  const { t } = useTranslation(["auth"]);
  const { theme } = useUnistyles();
  const router = useRouter();
  const params = forgotPasswordRouteParamsSchema.safeParse(useLocalSearchParams());
  const { status } = useAuth();
  // The address the last link went to; set once the server accepted the request.
  const [sentTo, setSentTo] = useState<string | null>(null);

  const { mutateAsync: forgotPassword, isPending } = useForgotPasswordMutation();

  const schema = useMemo(() => forgotPasswordSchema(t), [t]);

  // The server answers 202 whether or not the address has an account, so every
  // success is "check your inbox" — there is nothing else to branch on.
  const form = useForm({
    defaultValues: { email: params.success ? params.data.email : "" },
    validators: { onChange: schema, onSubmit: schema },
    onSubmit: async ({ value }) => {
      try {
        await forgotPassword({ email: value.email });
        setSentTo(value.email);
      } catch (error) {
        setApiFieldErrors(form, error);
        Toast.show({ type: "error", text1: getApiErrorMessage(error) });
      }
    },
  });

  const handleResend = async (address: string) => {
    try {
      await forgotPassword({ email: address });
      Toast.show({ type: "success", text1: t("auth:forgotPassword.sentTitle") });
    } catch (error) {
      Toast.show({ type: "error", text1: getApiErrorMessage(error) });
    }
  };

  return (
    <AuthBackground hero>
      <KeyboardAwareScrollView
        bottomOffset={theme.spacing(6)}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {sentTo ? (
          <>
            <AuthHeader
              icon={
                <MailIcon
                  width={theme.iconSize["3xl"]}
                  height={theme.iconSize["3xl"]}
                  color={theme.palette.brand.primaryDark}
                />
              }
              title={t("auth:forgotPassword.sentTitle")}
              subtitle={t("auth:forgotPassword.sentBody", { email: sentTo })}
            />
            <AuthSwitchRow
              prompt={t("auth:forgotPassword.resendPrompt")}
              action={t("auth:forgotPassword.resend")}
              disabled={isPending}
              onPress={() => void handleResend(sentTo)}
            />
          </>
        ) : (
          <>
            <AuthHeader
              title={t("auth:forgotPassword.title")}
              subtitle={t("auth:forgotPassword.subtitle")}
            />
            <View style={styles.form}>
              <form.Field name="email">
                {(field) => (
                  <AuthField
                    field={field}
                    label={t("auth:fields.email")}
                    placeholder={t("auth:fields.emailPlaceholder")}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                  />
                )}
              </form.Field>

              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <Button
                    variant="primary"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                    onPress={() => form.handleSubmit()}
                  >
                    {t("auth:forgotPassword.submit")}
                  </Button>
                )}
              </form.Subscribe>
            </View>
          </>
        )}
      </KeyboardAwareScrollView>

      {/* Reachable signed in (a dead reset link): never offer sign-in over a live session. */}
      {status !== "loading" && (
        <View style={styles.footer}>
          <Button
            variant="text"
            size="inline"
            onPress={() =>
              router.dismissTo(status === "authenticated" ? "/(tabs)/home" : "/(auth)/sign-in")
            }
          >
            {t(
              status === "authenticated"
                ? "auth:forgotPassword.backToApp"
                : "auth:forgotPassword.backToSignIn"
            )}
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
  footer: {
    alignItems: "center",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(5),
  },
}));
