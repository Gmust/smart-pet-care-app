import { useMemo } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "expo-router";

import type { AuthResponse } from "@/api/generated";
import { getApiError } from "@/errors/utils/getApiError";
import { getApiErrorMessage } from "@/errors/utils/getApiErrorMessage";
import { setApiFieldErrors } from "@/errors/utils/setApiFieldErrors";
import { Button } from "@/shadecn/ui/button";

import { useLoginMutation } from "../queries/useLoginMutation";
import { loginSchema } from "../schemas/auth.schema";

import { AuthField } from "./AuthField";

interface SignInFormProps {
  onAuthenticated: (response: AuthResponse) => Promise<void>;
  /** Other ways in, laid out under the submit button. */
  children?: ReactNode;
}

export const SignInForm = ({ onAuthenticated, children }: SignInFormProps) => {
  const { t } = useTranslation(["auth"]);
  const router = useRouter();

  const { mutateAsync: login } = useLoginMutation();

  const schema = useMemo(() => loginSchema(t), [t]);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: { onChange: schema, onSubmit: schema },
    onSubmit: async ({ value }) => {
      try {
        const response = await login({ email: value.email, password: value.password });
        await onAuthenticated(response);
        Toast.show({
          type: "success",
          text1: t("auth:success.welcomeBackTitle"),
          text2: t("auth:success.welcomeBackBody"),
        });
      } catch (error) {
        // Signed up but never confirmed: the next step is the code, not a retry.
        if (getApiError(error).code === "EMAIL_NOT_CONFIRMED") {
          Toast.show({ type: "info", text1: getApiErrorMessage(error) });
          router.push({ pathname: "/(auth)/confirm-email", params: { email: value.email } });
          return;
        }
        setApiFieldErrors(form, error);
        Toast.show({
          type: "error",
          text1: getApiErrorMessage(error, t("auth:errors.signInFailed")),
        });
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
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
            />
          )}
        </form.Field>
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
              {t("auth:actions.login")}
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
    gap: theme.spacing(8),
  },
  fields: {
    gap: theme.spacing(4),
  },
  actions: {
    gap: theme.spacing(4),
  },
}));
