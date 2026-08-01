import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/shadecn/ui/button";
import { FieldError } from "@/shadecn/ui/field-error";
import { Input } from "@/shadecn/ui/input";
import { Text } from "@/shadecn/ui/text";

import { useConfirmEmailMutation } from "../queries/useConfirmEmailMutation";
import { useResendConfirmationMutation } from "../queries/useResendConfirmationMutation";
import { confirmEmailSchema } from "../schemas/confirm-email.schema";
import { getProblemMessage } from "../utils/auth-errors";

export default function ConfirmEmailPage() {
  const { t } = useTranslation(["auth"]);
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();

  const { mutateAsync: confirmEmail } = useConfirmEmailMutation();
  const { mutateAsync: resendConfirmation, isPending: isResending } =
    useResendConfirmationMutation();

  const schema = useMemo(() => confirmEmailSchema(t), [t]);

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
        Toast.show({
          type: "success",
          text1: t("auth:success.emailConfirmedTitle"),
          text2: t("auth:success.emailConfirmedBody"),
        });
        router.replace({ pathname: "/(auth)/sign-in", params: { mode: "login" } });
      } catch (error) {
        const message = getProblemMessage(error, t("auth:errors.confirmFailed"));
        Toast.show({ type: "error", text1: message });
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
      const message = getProblemMessage(error, t("auth:errors.resendFailed"));
      Toast.show({ type: "error", text1: message });
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("auth:confirmEmail.title")}</Text>
          <Text style={styles.subtitle}>
            {email
              ? t("auth:confirmEmail.subtitle", { email })
              : t("auth:confirmEmail.subtitleFallback")}
          </Text>
        </View>

        <form.Field name="code">
          {(field) => (
            <View style={styles.field}>
              <Input
                label={t("auth:confirmEmail.codeLabel")}
                placeholder={t("auth:confirmEmail.codePlaceholder")}
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.length > 0}
                keyboardType="number-pad"
                maxLength={6}
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
              />
              <FieldError errors={field.state.meta.errors} />
            </View>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              size="lg"
              variant="primary"
              disabled={!canSubmit}
              isLoading={isSubmitting}
              onPress={() => form.handleSubmit()}
            >
              {t("auth:confirmEmail.submit")}
            </Button>
          )}
        </form.Subscribe>

        <Button variant="link" size="md" disabled={isResending} onPress={handleResend}>
          {t("auth:confirmEmail.resend")}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.palette.brand.surfacePage,
  },
  content: {
    paddingHorizontal: theme.spacing(5),
    paddingTop: theme.spacing(6),
    gap: theme.spacing(6),
  },
  header: {
    gap: theme.spacing(2),
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize["3xl"],
    color: theme.palette.brand.textBody,
    letterSpacing: -0.25,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.base,
    lineHeight: theme.textSizing(1.4),
    color: theme.palette.brand.textSecondary,
  },
  field: {
    gap: theme.spacing(1),
  },
}));
