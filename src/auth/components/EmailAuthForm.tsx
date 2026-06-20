import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import { useForm } from "@tanstack/react-form";

import type { AuthResponse } from "@/api/generated";
import { Button } from "@/shadecn/ui/button";
import { FieldError } from "@/shadecn/ui/field-error";
import { Input } from "@/shadecn/ui/input";

import { useLoginMutation } from "../queries/useLoginMutation";
import { useRegisterMutation } from "../queries/useRegisterMutation";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import type { AuthMode } from "../types";
import { getProblemMessage } from "../utils/auth-errors";

interface EmailAuthFormProps {
  mode: AuthMode;
  termsPreAccepted: boolean;
  onAuthenticated: (response: AuthResponse) => void;
}

export function EmailAuthForm({ mode, termsPreAccepted, onAuthenticated }: EmailAuthFormProps) {
  const { t } = useTranslation(["auth"]);
  const isRegister = mode === "register";

  const { mutateAsync: register } = useRegisterMutation();
  const { mutateAsync: login } = useLoginMutation();

  const schema = useMemo(() => (isRegister ? registerSchema(t) : loginSchema(t)), [isRegister, t]);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
    },
    validators: { onChange: schema, onSubmit: schema },
    onSubmit: async ({ value }) => {
      try {
        if (isRegister) {
          const response = await register({
            email: value.email,
            password: value.password,
            passwordConfirm: value.passwordConfirm,
            termsAccepted: termsPreAccepted,
          });
          Toast.show({
            type: "success",
            text1: t("auth:success.accountCreatedTitle"),
            text2: t("auth:success.accountCreatedBody"),
          });
          await new Promise((resolve) => setTimeout(resolve, 350));
          onAuthenticated(response);
          return;
        }

        const response = await login({ email: value.email, password: value.password });
        Toast.show({
          type: "success",
          text1: t("auth:success.welcomeBackTitle"),
          text2: t("auth:success.welcomeBackBody"),
        });
        await new Promise((resolve) => setTimeout(resolve, 350));
        onAuthenticated(response);
      } catch (error) {
        const message = getProblemMessage(
          error,
          isRegister ? t("auth:errors.registerFailed") : t("auth:errors.loginFailed")
        );
        Toast.show({ type: "error", text1: message });
      }
    },
  });

  return (
    <View style={styles.container}>
      <form.Field name="email">
        {(field) => (
          <View style={styles.field}>
            <Input
              label={t("auth:fields.email")}
              placeholder={t("auth:fields.emailPlaceholder")}
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              error={field.state.meta.errors.length > 0}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <FieldError errors={field.state.meta.errors} />
          </View>
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <View style={styles.field}>
            <Input
              label={t("auth:fields.password")}
              placeholder={t("auth:fields.passwordPlaceholder")}
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              error={field.state.meta.errors.length > 0}
              secureTextEntry
              autoCapitalize="none"
              autoComplete={isRegister ? "new-password" : "current-password"}
              textContentType={isRegister ? "newPassword" : "password"}
            />
            <FieldError errors={field.state.meta.errors} />
          </View>
        )}
      </form.Field>

      {isRegister ? (
        <form.Field name="passwordConfirm">
          {(field) => (
            <View style={styles.field}>
              <Input
                label={t("auth:fields.passwordConfirm")}
                placeholder={t("auth:fields.passwordConfirmPlaceholder")}
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.length > 0}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
              />
              <FieldError errors={field.state.meta.errors} />
            </View>
          )}
        </form.Field>
      ) : null}

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button
            size="lg"
            variant="primary"
            disabled={!canSubmit}
            isLoading={isSubmitting}
            onPress={() => form.handleSubmit()}
          >
            {isRegister ? t("auth:actions.register") : t("auth:actions.login")}
          </Button>
        )}
      </form.Subscribe>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing(4),
  },
  field: {
    gap: theme.spacing(1),
  },
}));
