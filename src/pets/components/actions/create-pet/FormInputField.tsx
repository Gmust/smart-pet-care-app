import type { TextInputProps } from "react-native";
import type { AnyFieldApi } from "@tanstack/react-form";

import { useVisibleFieldErrors } from "@/common/hooks/useVisibleFieldErrors";
import { getFirstFieldError } from "@/common/utils/getFirstFieldError";
import { Input } from "@/shadecn/ui/input";

type FormInputFieldProps = Pick<TextInputProps, "keyboardType" | "placeholder"> & {
  field: AnyFieldApi;
  label: string;
};

export const FormInputField = ({ field, label, ...inputProps }: FormInputFieldProps) => {
  const errors = useVisibleFieldErrors(field);
  const message = getFirstFieldError(errors);

  return (
    <Input
      {...inputProps}
      label={label}
      value={field.state.value ?? ""}
      onChangeText={field.handleChange}
      onBlur={() => {
        if (field.state.value && !field.state.value.trim()) field.handleChange("");
        field.handleBlur();
      }}
      error={!!message}
      helperText={message}
    />
  );
};
