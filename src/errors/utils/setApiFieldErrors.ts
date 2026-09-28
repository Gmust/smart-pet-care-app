import type { AnyFieldMeta, AnyFieldMetaBase, DeepKeys, Updater } from "@tanstack/react-form";
import i18next from "i18next";

import { getApiError } from "./getApiError";
import { isTranslatedCode } from "./getApiErrorMessage";

interface FormWithFields<TFormData> {
  state: { values: TFormData };
  getFieldMeta: <TField extends DeepKeys<TFormData>>(field: TField) => AnyFieldMeta | undefined;
  setFieldMeta: <TField extends DeepKeys<TFormData>>(
    field: TField,
    updater: Updater<AnyFieldMetaBase>
  ) => void;
}

/**
 * Shows the server's per-field validation aliases under the matching fields.
 * The server keys `errors` by DTO property ("Email") and forms use camelCase
 * ("email"), so names match case-insensitively. Set as an `onSubmit` error, it
 * clears as soon as the user enters a valid value. Fields the form does not
 * have, and aliases with no translation, are left to the caller's toast.
 */
export const setApiFieldErrors = <TFormData extends object>(
  form: FormWithFields<TFormData>,
  error: unknown
): void => {
  const { fieldErrors } = getApiError(error);
  const isFormField = (key: string): key is DeepKeys<TFormData> & string =>
    Object.hasOwn(form.state.values, key);
  // Rendered fields only: a field that is in the values but not on screen
  // (password confirm on login) has no meta to update, and an error there
  // could not be seen or edited, yet would keep the form from submitting.
  const formFields = Object.keys(form.state.values)
    .filter(isFormField)
    .filter((name) => form.getFieldMeta(name) !== undefined);

  for (const [serverField, aliases] of Object.entries(fieldErrors)) {
    const field = formFields.find((name) => name.toLowerCase() === serverField.toLowerCase());
    // Field aliases carry no params, so their copy must not need any.
    const messages = aliases
      .filter(isTranslatedCode)
      .map((alias) => i18next.t(`errors:codes.${alias}`));
    if (!field || messages.length === 0) continue;

    form.setFieldMeta(field, (prev) => ({
      ...prev,
      errorMap: { ...prev.errorMap, onSubmit: messages },
    }));
  }
};
