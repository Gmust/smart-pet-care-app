/// <reference types="jest" />

/**
 * Error contract v1, checked against the real backend. Every case asserts the
 * status and alias the app branches on, the fields every failure must carry,
 * and that the alias has a translation, so it never reaches the user as server
 * English. The interceptor cases run the app's real auth interceptor against
 * real 401s.
 *
 *   pnpm test:api
 *   API_TEST_EMAIL=you@example.com API_TEST_PASSWORD=... pnpm test:api
 *
 * Anonymous cases need only EXPO_PUBLIC_API_URL (read from .env). Signed-in
 * cases need a confirmed account and are skipped without one; use a dedicated
 * test account, because they rotate its refresh token. No case creates data:
 * every write is one the server must reject.
 */

import { FieldApi, FormApi } from "@tanstack/react-form";
import axios from "axios";

import type { AuthResponse } from "@/api/generated";
import { getSmartPetCareAPI } from "@/api/generated";
import {
  registerAuthInterceptors,
  setAuthToken,
  setRefreshAuthSessionHandler,
  setUnauthorizedHandler,
} from "@/api/interceptors";
import errorsEn from "@/errors/locales/en.json";
import { getApiError } from "@/errors/utils/getApiError";
import { setApiFieldErrors } from "@/errors/utils/setApiFieldErrors";
import i18n from "@/i18n";

const baseURL = process.env.EXPO_PUBLIC_API_URL;
if (!baseURL) throw new Error("EXPO_PUBLIC_API_URL is not set. Add it to .env.");

// No interceptors: sees exactly what the server answers.
const bare = getSmartPetCareAPI(axios.create({ baseURL }));

const unknownEmail = () => `contract-test-${crypto.randomUUID()}@example.com`;

/** Awaits a request that must fail and checks it against the contract. */
const expectFailure = async (request: Promise<unknown>, status: number, code: string) => {
  let caught: unknown = new Error("Expected the request to fail, but it succeeded.");
  try {
    await request;
  } catch (error) {
    caught = error;
  }
  // Anything but an HTTP answer (DNS, timeout, the success above) is rethrown as is.
  if (!axios.isAxiosError(caught) || !caught.response) throw caught;

  const body: unknown = caught.response.data;
  expect({ status: caught.response.status, code: getApiError(caught).code }).toEqual({
    status,
    code,
  });
  expect(body).toMatchObject({ message: expect.any(String), traceId: expect.any(String) });
  // `retryable` is for dependency failures; a 4xx is fixed by changing the request.
  if (status < 500) expect(body).not.toHaveProperty("retryable");
  expect(Object.keys(errorsEn.codes)).toContain(code);
  return body;
};

/** Every alias in `errors` must be translatable too: forms show them per field. */
const expectTranslated = (aliases: string[]) => {
  expect(Object.keys(errorsEn.codes)).toEqual(expect.arrayContaining(aliases));
  // Field aliases arrive without params, so their copy must not need any.
  const needingParams = Object.entries(errorsEn.codes)
    .filter(([alias, text]) => aliases.includes(alias) && text.includes("{{"))
    .map(([alias]) => alias);
  expect(needingParams).toEqual([]);
};

/**
 * The app's real interceptor on a fresh client, with a refresh handler that
 * mirrors AuthContext.refreshSessionWithToken: it refreshes past the
 * interceptor (like the app's noAuthApi-bound postApiAuthRefresh), hands a
 * re-entrant caller the in-flight promise, and installs the new access token
 * before resolving.
 */
const createSignedInClient = (
  refreshToken: string,
  onRefreshed: (tokens: AuthResponse) => void = () => undefined
) => {
  const client = axios.create({ baseURL });
  registerAuthInterceptors(client);
  const api = getSmartPetCareAPI(client);

  let inFlight: Promise<string | null> | null = null;
  const refresh = jest.fn(() => {
    inFlight ??= bare
      .postApiAuthRefresh({ refreshToken })
      .then(({ data }) => {
        onRefreshed(data);
        setAuthToken(data.accessToken ?? null);
        return data.accessToken ?? null;
      })
      .catch(() => null)
      .finally(() => {
        inFlight = null;
      });
    return inFlight;
  });
  const onUnauthorized = jest.fn();
  setRefreshAuthSessionHandler(refresh);
  setUnauthorizedHandler(onUnauthorized);

  return { api, refresh, onUnauthorized };
};

afterEach(() => {
  setRefreshAuthSessionHandler(null);
  setUnauthorizedHandler(null);
  setAuthToken(null);
});

describe("error contract: anonymous", () => {
  it("401 auth_authentication_required without a token", async () => {
    await expectFailure(bare.getApiPets(), 401, "auth_authentication_required");
  });

  it("401 auth_authentication_required for a token that fails validation", async () => {
    await expectFailure(
      bare.getApiPets({ headers: { Authorization: "Bearer not.a.jwt" } }),
      401,
      "auth_authentication_required"
    );
  });

  it("401 auth_refresh_token_invalid for an unknown refresh token, even with a dead bearer", async () => {
    // The app sends its stale bearer along with the refresh. If this ever came
    // back as auth_authentication_required, the interceptor would refresh the
    // refresh call itself.
    await expectFailure(
      bare.postApiAuthRefresh(
        { refreshToken: crypto.randomUUID() },
        { headers: { Authorization: "Bearer not.a.jwt" } }
      ),
      401,
      "auth_refresh_token_invalid"
    );
  });

  it("401 auth_invalid_credentials for a wrong password", async () => {
    await expectFailure(
      bare.postApiAuthLogin({ email: unknownEmail(), password: "Wrong-password-1!" }),
      401,
      "auth_invalid_credentials"
    );
  });

  it("401 auth_google_failed for a token Google rejects", async () => {
    await expectFailure(
      bare.postApiAuthOauthGoogleMobile({ idToken: "not-a-google-token" }),
      401,
      "auth_google_failed"
    );
  });

  it("400 request_validation_failed with field aliases keyed by PascalCase field name", async () => {
    const body = await expectFailure(
      bare.postApiAuthLogin({ email: "", password: "" }),
      400,
      "request_validation_failed"
    );

    expect(body).toMatchObject({
      errors: { Email: ["auth_email_required"], Password: ["auth_password_required"] },
    });
    expectTranslated(["auth_email_required", "auth_password_required"]);
  });

  it("lands real field aliases on the matching fields of a form", async () => {
    // The login screen's form: passwordConfirm is in the values but not rendered.
    const form = new FormApi({ defaultValues: { email: "", password: "", passwordConfirm: "" } });
    form.mount();
    new FieldApi({ form, name: "email" }).mount();
    new FieldApi({ form, name: "password" }).mount();

    let failure: unknown;
    try {
      await bare.postApiAuthLogin({ email: "", password: "" });
    } catch (error) {
      failure = error;
    }
    setApiFieldErrors(form, failure);

    expect(form.getFieldMeta("email")?.errors).toEqual([
      i18n.t("errors:codes.auth_email_required"),
    ]);
    expect(form.getFieldMeta("password")?.errors).toEqual([
      i18n.t("errors:codes.auth_password_required"),
    ]);
    expect(form.getFieldMeta("passwordConfirm")).toBeUndefined();
  });

  it("400 lists every rule a field failed on register", async () => {
    // Invalid on purpose: a register that passed would create an account.
    const body = await expectFailure(
      bare.postApiAuthRegister({
        email: "not-an-email",
        password: "a",
        passwordConfirm: "a",
        termsAccepted: false,
      }),
      400,
      "request_validation_failed"
    );

    expect(body).toMatchObject({
      errors: {
        Email: expect.arrayContaining(["auth_email_invalid"]),
        Password: expect.arrayContaining(["auth_password_too_short", "auth_password_too_weak"]),
      },
    });
    expectTranslated(["auth_email_invalid", "auth_password_too_short", "auth_password_too_weak"]);
  });

  it("400 auth_confirmation_code_malformed for a code that is not six digits", async () => {
    const body = await expectFailure(
      bare.postApiAuthConfirmEmail({ email: unknownEmail(), code: "12" }),
      400,
      "request_validation_failed"
    );

    expect(body).toMatchObject({ errors: { Code: ["auth_confirmation_code_malformed"] } });
    expectTranslated(["auth_confirmation_code_malformed"]);
  });

  it("400 CONFIRMATION_CODE_INVALID keeps its screaming-case alias", async () => {
    await expectFailure(
      bare.postApiAuthConfirmEmail({ email: unknownEmail(), code: "123456" }),
      400,
      "CONFIRMATION_CODE_INVALID"
    );
  });

  it("404 auth_account_not_found when resending to an unknown address", async () => {
    await expectFailure(
      bare.postApiAuthResendConfirmation({ email: unknownEmail() }),
      404,
      "auth_account_not_found"
    );
  });
});

describe("auth interceptor against the real server", () => {
  it("ends the session instead of hanging when the refresh token is dead too", async () => {
    // Access token rejected, then the refresh itself answers 401. Before the
    // fix this request never settled and the test hit its timeout.
    const { api, refresh, onUnauthorized } = createSignedInClient(crypto.randomUUID());
    setAuthToken("not.a.jwt");

    await expectFailure(api.getApiPets(), 401, "auth_authentication_required");
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(onUnauthorized).toHaveBeenCalled();
  });

  it("a wrong password neither refreshes nor signs out", async () => {
    const { api, refresh, onUnauthorized } = createSignedInClient(crypto.randomUUID());

    await expectFailure(
      api.postApiAuthLogin({ email: unknownEmail(), password: "Wrong-password-1!" }),
      401,
      "auth_invalid_credentials"
    );
    expect(refresh).not.toHaveBeenCalled();
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it("a rejected Google token neither refreshes nor signs out", async () => {
    const { api, refresh, onUnauthorized } = createSignedInClient(crypto.randomUUID());

    await expectFailure(
      api.postApiAuthOauthGoogleMobile({ idToken: "not-a-google-token" }),
      401,
      "auth_google_failed"
    );
    expect(refresh).not.toHaveBeenCalled();
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});

const email = process.env.API_TEST_EMAIL;
const password = process.env.API_TEST_PASSWORD;

(email && password ? describe : describe.skip)("error contract: signed in", () => {
  let accessToken = "";
  let refreshToken = "";

  const keep = (tokens: AuthResponse) => {
    if (!tokens.accessToken || !tokens.refreshToken) {
      throw new Error("Auth response carried no tokens.");
    }
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
  };
  const signedIn = () => ({ headers: { Authorization: `Bearer ${accessToken}` } });

  beforeAll(async () => {
    keep((await bare.postApiAuthLogin({ email: email ?? "", password: password ?? "" })).data);
  });

  it("accepts the live token", async () => {
    await expect(bare.getApiPets(signedIn())).resolves.toMatchObject({ status: 200 });
  });

  it("404 pet_not_found for a pet that does not exist or is not the caller's", async () => {
    await expectFailure(bare.getApiPetsId(crypto.randomUUID(), signedIn()), 404, "pet_not_found");
  });

  it("404 pet_not_found (was 400) on the reminder list for an unknown pet", async () => {
    await expectFailure(
      bare.getApiRemindersPetPetId(crypto.randomUUID(), signedIn()),
      404,
      "pet_not_found"
    );
  });

  it("404 pet_not_found on the wellness evaluation for an unknown pet", async () => {
    await expectFailure(
      bare.getApiPetsPetIdWellnessEvaluation(crypto.randomUUID(), signedIn()),
      404,
      "pet_not_found"
    );
  });

  it("404 pet_not_found on a PATCH to an unknown pet", async () => {
    await expectFailure(
      bare.patchApiPetsId(crypto.randomUUID(), { name: "Contract test" }, signedIn()),
      404,
      "pet_not_found"
    );
  });

  it("404 chat_session_not_found for an unknown chat", async () => {
    await expectFailure(
      bare.getApiSessionsSessionIdMessages(crypto.randomUUID(), undefined, signedIn()),
      404,
      "chat_session_not_found"
    );
  });

  it("404 chat_session_not_found when sending to or retrying in an unknown chat", async () => {
    // The assistant restores the session on exactly this alias and no other 404.
    const sessionId = crypto.randomUUID();
    await expectFailure(
      bare.postApiSessionsSessionIdMessages(
        sessionId,
        { clientMessageId: crypto.randomUUID(), text: "Contract test" },
        signedIn()
      ),
      404,
      "chat_session_not_found"
    );
    await expectFailure(
      bare.postApiSessionsSessionIdMessagesMessageIdRetry(
        sessionId,
        crypto.randomUUID(),
        signedIn()
      ),
      404,
      "chat_session_not_found"
    );
  });

  it("409 EMAIL_ALREADY_CONFIRMED on confirm and resend for a confirmed address", async () => {
    // The confirm screen treats this as success and moves on to sign-in.
    await expectFailure(
      bare.postApiAuthConfirmEmail({ email: email ?? "", code: "000000" }),
      409,
      "EMAIL_ALREADY_CONFIRMED"
    );
    await expectFailure(
      bare.postApiAuthResendConfirmation({ email: email ?? "" }),
      409,
      "EMAIL_ALREADY_CONFIRMED"
    );
  });

  it("refreshes a rejected access token once and replays the request", async () => {
    const { api, refresh, onUnauthorized } = createSignedInClient(refreshToken, keep);
    // Same header and claims, broken signature: fails validation like an expired token.
    const [header, payload] = accessToken.split(".");
    setAuthToken(`${header}.${payload}.${"A".repeat(43)}`);

    await expect(api.getApiPets()).resolves.toMatchObject({ status: 200 });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  // Last: a server that revokes the whole token family on reuse would end the
  // session for any case after this one.
  it("401 auth_refresh_token_invalid for a spent refresh token", async () => {
    const spent = refreshToken;
    keep((await bare.postApiAuthRefresh({ refreshToken: spent })).data);

    await expectFailure(
      bare.postApiAuthRefresh({ refreshToken: spent }),
      401,
      "auth_refresh_token_invalid"
    );
  });
});
