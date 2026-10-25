import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { TextInputProps } from "react-native";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import type { AnyFieldApi } from "@tanstack/react-form";

import { useVisibleFieldErrors } from "@/common/hooks/useVisibleFieldErrors";
import { EyeClosedIcon, EyeIcon } from "@/icons/eye";
import { Button } from "@/shadecn/ui/button";
import { FieldError } from "@/shadecn/ui/field-error";
import { Input } from "@/shadecn/ui/input";

interface AuthFieldProps extends Pick<
  TextInputProps,
  "autoCapitalize" | "autoComplete" | "keyboardType" | "maxLength" | "textContentType"
> {
  field: AnyFieldApi;
  label: string;
  placeholder: string;
  /** Shown under the field until it has an error, which replaces it. */
  hint?: string;
  secure?: boolean;
}

export const AuthField = ({
  field,
  label,
  placeholder,
  hint,
  secure = false,
  ...inputProps
}: AuthFieldProps) => {
  const { t } = useTranslation(["auth"]);
  const { theme } = useUnistyles();
  const [revealed, setRevealed] = useState(false);

  const errors = useVisibleFieldErrors(field);
  const EyeComponent = revealed ? EyeIcon : EyeClosedIcon;

  return (
    <View style={styles.field}>
      <Input
        {...inputProps}
        label={label}
        placeholder={placeholder}
        value={field.state.value}
        onChangeText={field.handleChange}
        onBlur={field.handleBlur}
        error={errors.length > 0}
        helperText={errors.length > 0 ? undefined : hint}
        secureTextEntry={secure && !revealed}
        rightSlot={
          secure ? (
            <Button
              variant="text"
              size="hug"
              hitSlop={(theme.minTouchTarget - theme.iconSize.md) / 2}
              accessibilityLabel={t(
                revealed ? "auth:fields.hidePassword" : "auth:fields.showPassword"
              )}
              onPress={() => setRevealed((value) => !value)}
              icon={
                <EyeComponent
                  width={theme.iconSize.md}
                  height={theme.iconSize.md}
                  color={theme.palette.brand.textSecondary}
                />
              }
            />
          ) : undefined
        }
      />
      <FieldError errors={errors} />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  field: {
    gap: theme.spacing(1),
  },
}));
