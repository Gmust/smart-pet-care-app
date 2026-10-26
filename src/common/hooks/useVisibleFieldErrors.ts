import type { AnyFieldApi } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-form";

export const useVisibleFieldErrors = (field: AnyFieldApi) => {
  const submitted = useStore(field.form.store, (state) => state.submissionAttempts > 0);

  return field.state.meta.isBlurred || submitted ? field.state.meta.errors : [];
};
