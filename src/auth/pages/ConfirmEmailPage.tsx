import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getApiError } from "@/errors/utils/getApiError";
import { getApiErrorMessage } from "@/errors/utils/getApiErrorMessage";
import { setApiFieldErrors } from "@/errors/utils/setApiFieldErrors";
import { MailIcon } from "@/icons/mail";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";

import { AuthBackground } from "../components/AuthBackground";
import { AuthField } from "../components/AuthField";
import { AuthSwitchRow } from "../components/AuthSwitchRow";
import { useConfirmEmailMutation } from "../queries/useConfirmEmailMutation";
import { useResendConfirmationMutation } from "../queries/useResendConfirmationMutation";
import { confirmEmailSchema } from "../schemas/confirm-email.schema";

export default function ConfirmEmailPage() {
  const { t } = useTranslation(["auth"]);
  const { theme } = useUnistyles();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();

  const { mutateAsync: confirmEmail } = useConfirmEmailMutation();
  const { mutateAsync: resendConfirmation, isPending: isResending } =
    useResendConfirmationMutation();

  const schema = useMemo(() => confirmEmailSchema(t), [t]);

  // Whichever screen led here, leave the stack as welcome, sign-in.
  const goToSignIn = () => {
    router.dismissAll();
    router.push("/(auth)/sign-in");
  };

  // Confirmed just now or earlier (another device, a second tap): sign in next.
  const finishAndSignIn = (text1: string, text2?: string) => {
    Toast.show({ type: "success", text1, text2 });
    goToSignIn();
  };

  const form = useForm({
    defaultValues: { code: "" },
    validators: { onChange: schema, onSubmit: schema },
    onSubmit: async ({ value }) => {
      if (!email) {
        Toast.show({ type: "error", text1: t("auth:errors.confirmFailed") });
        return;
      }

      try {
        await confirmEmail({ email, code: value.code });
        finishAndSignIn(
          t("auth:success.emailConfirmedTitle"),
          t("auth:success.emailConfirmedBody")
        );
      } catch (error) {
        const { code } = getApiError(error);
        if (code === "EMAIL_ALREADY_CONFIRMED") {
          finishAndSignIn(getApiErrorMessage(error));
          return;
        }
        // Retyping cannot revive an expired or locked-out code: clear it so the
        // next step is Resend.
        if (code === "CONFIRMATION_CODE_EXPIRED" || code === "CONFIRMATION_TOO_MANY_ATTEMPTS") {
          form.reset();
        }
        setApiFieldErrors(form, error);
        Toast.show({ type: "error", text1: getApiErrorMessage(error) });
      }
    },
  });

  const handleResend = async () => {
    if (!email) {
      Toast.show({ type: "error", text1: t("auth:errors.confirmFailed") });
      return;
    }

    try {
      await resendConfirmation({ email });
      Toast.show({ type: "success", text1: t("auth:success.codeResentTitle") });
    } catch (error) {
      if (getApiError(error).code === "EMAIL_ALREADY_CONFIRMED") {
        finishAndSignIn(getApiErrorMessage(error));
        return;
      }
      Toast.show({ type: "error", text1: getApiErrorMessage(error) });
    }
  };

  return (
    <AuthBackground hero>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.badge}>
            <MailIcon
              width={theme.iconSize["3xl"]}
              height={theme.iconSize["3xl"]}
              color={theme.palette.brand.primaryDark}
            />
          </View>
          <Text variant="display" style={styles.title}>
            {t("auth:confirmEmail.title")}
          </Text>
          <Text variant="body" style={styles.subtitle}>
            {email
              ? t("auth:confirmEmail.subtitle", { email })
              : t("auth:confirmEmail.subtitleFallback")}
          </Text>
        </View>

        <View style={styles.actions}>
          <form.Field name="code">
            {(field) => (
              <AuthField
                field={field}
                label={t("auth:confirmEmail.codeLabel")}
                placeholder={t("auth:confirmEmail.codePlaceholder")}
                keyboardType="number-pad"
                maxLength={6}
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
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
                {t("auth:confirmEmail.submit")}
              </Button>
            )}
          </form.Subscribe>

          <AuthSwitchRow
            prompt={t("auth:confirmEmail.resendPrompt")}
            action={t("auth:confirmEmail.resend")}
            disabled={isResending}
            onPress={handleResend}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button variant="text" size="inline" onPress={goToSignIn}>
          {t("auth:confirmEmail.backToSignIn")}
        </Button>
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing(6),
    paddingHorizontal: theme.spacing(5),
    paddingTop: theme.spacing(43),
    paddingBottom: theme.spacing(5),
  },
  header: {
    gap: theme.spacing(3),
  },
  badge: {
    width: theme.spacing(18),
    height: theme.spacing(18),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.brand.primarySoft,
  },
  title: {
    color: theme.palette.brand.textPrimary,
  },
  subtitle: {
    color: theme.palette.brand.textSecondary,
  },
  actions: {
    gap: theme.spacing(4),
  },
  footer: {
    alignItems: "center",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(5),
  },
}));
