/// <reference types="jest" />

import errorsEn from "../locales/en.json";

// The field-level aliases from the error contract. They arrive as bare strings
// inside `errors`, never with `params`.
const FIELD_ALIASES = [
  "auth_email_required",
  "auth_email_invalid",
  "auth_password_required",
  "auth_password_too_short",
  "auth_password_too_weak",
  "auth_password_confirm_required",
  "auth_passwords_do_not_match",
  "auth_terms_not_accepted",
  "auth_confirmation_code_required",
  "auth_confirmation_code_malformed",
  "chat_pet_id_required",
  "chat_client_message_id_required",
  "chat_message_text_required",
  "chat_message_text_too_long",
  "pet_species_required",
  "feeding_time_required",
  "weight_log_measurement_time_required",
  "reminder_utc_offset_required",
  "nutrition_breed_too_long",
  "nutrition_weight_out_of_range",
  "nutrition_age_out_of_range",
  "nutrition_products_too_many",
  "nutrition_product_name_required",
  "nutrition_product_name_too_long",
  "nutrition_product_calories_out_of_range",
];

describe("field alias copy", () => {
  it("never needs params, because field aliases arrive without them", () => {
    // Otherwise the form shows "Use {{params.maxLength}} characters" verbatim.
    const needingParams = Object.entries(errorsEn.codes)
      .filter(([alias, text]) => FIELD_ALIASES.includes(alias) && text.includes("{{"))
      .map(([alias]) => alias);

    expect(needingParams).toEqual([]);
  });
});
