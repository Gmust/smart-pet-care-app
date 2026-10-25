/// <reference types="jest" />

import type { TFunction } from "i18next";

import { registerSchema } from "./auth.schema";

// A passthrough: the schema only calls `t` with a key, and the full TFunction type has no cheap fake.
const t = ((key: string) => key) as TFunction<["auth"]>;

const passwordMessages = (password: string) => {
  const result = registerSchema(t).safeParse({
    email: "milo@example.com",
    password,
    passwordConfirm: password,
  });
  return result.success
    ? []
    : result.error.issues.filter((issue) => issue.path[0] === "password").map((i) => i.message);
};

describe("registerSchema password", () => {
  it("accepts a password with a letter, a number and a special character", () => {
    expect(passwordMessages("Secret-1")).toEqual([]);
  });

  it("asks only for what is missing", () => {
    expect(passwordMessages("secret-1")).toEqual([]);
    expect(passwordMessages("secretsecret")).toEqual([
      "auth:validation.passwordNeedsDigit",
      "auth:validation.passwordNeedsSpecial",
    ]);
    expect(passwordMessages("123456!")).toEqual(["auth:validation.passwordNeedsLetter"]);
  });

  it("reports a short password together with its missing rules", () => {
    expect(passwordMessages("ab")).toEqual([
      "auth:validation.passwordMin",
      "auth:validation.passwordNeedsDigit",
      "auth:validation.passwordNeedsSpecial",
    ]);
  });

  it("reports an empty password as required only", () => {
    expect(passwordMessages("")).toEqual(["auth:validation.passwordRequired"]);
  });
});
