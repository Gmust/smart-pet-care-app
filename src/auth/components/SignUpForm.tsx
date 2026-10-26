import { useMemo } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "expo-router";

import { getApiErrorMessage } from "@/errors/utils/getApiErrorMessage";
import { setApiFieldErrors } from "@/errors/utils/setApiFieldErrors";
import { Button } from "@/shadecn/ui/button";

import { useRegisterMutation } from "../queries/useRegisterMutation";
import { registerSchema } from "../schemas/auth.schema";

import { AuthField } from "./AuthField";
import { SignUpConsent } from "./SignUpConsent";

interface SignUpFormProps {
  /** Other ways in, laid out under the submit button. */
  children?: ReactNode;
}

export const SignUpForm = ({ children }: SignUpFormProps) => {
  const { t } = useTranslation(["auth"]);
  const router = useRouter();

  const { mutateAsync: register } = useRegisterMutation();

  const schema = useMemo(() => registerSchema(t), [t]);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      termsAccepted: false,
    },
    validators: { onChange: schema, onSubmit: schema },
    onSubmit: async ({ value }) => {
      try {
        await register({
          email: value.email,
          password: value.password,
          passwordConfirm: value.passwordConfirm,
          termsAccepted: value.termsAccepted,
        });
        Toast.show({
          type: "success",
          text1: t("auth:success.accountCreatedTitle"),
          text2: t("auth:success.accountCreatedBody"),
        });
        router.push({ pathname: "/(auth)/confirm-email", params: { email: value.email } });
      } catch (error) {
        setApiFieldErrors(form, error);
        Toast.show({ type: "error", text1: getApiErrorMessage(error) });
      }
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.fields}>
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

        <form.Field name="password">
          {(field) => (
            <AuthField
              field={field}
              secure
              label={t("auth:fields.password")}
              placeholder={t("auth:fields.passwordPlaceholder")}
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

        <form.Field name="termsAccepted">{(field) => <SignUpConsent field={field} />}</form.Field>
      </View>

      <View style={styles.actions}>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button
              variant="primary"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              onPress={() => form.handleSubmit()}
            >
              {t("auth:actions.register")}
            </Button>
          )}
        </form.Subscribe>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing(6),
  },
  fields: {
    gap: theme.spacing(4),
  },
  actions: {
    gap: theme.spacing(4),
  },
}));
