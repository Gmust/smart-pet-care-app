/// <reference types="jest" />

/**
 * How the server treats a blank note field, checked against the real backend.
 * The UI lets a note have a blank title or blank content; the server used to
 * reject both, and these cases are what let that workaround be removed.
 *
 *   API_TEST_EMAIL=you@example.com API_TEST_PASSWORD=... pnpm test:api
 *
 * Unlike the error-contract suite, these cases create notes, so each one deletes
 * what it made. They need a confirmed account that already owns at least one pet.
 */

import axios from "axios";

import { getSmartPetCareAPI } from "@/api/generated";
import { getApiError } from "@/errors/utils/getApiError";

const baseURL = process.env.EXPO_PUBLIC_API_URL;
if (!baseURL) throw new Error("EXPO_PUBLIC_API_URL is not set. Add it to .env.");

const bare = getSmartPetCareAPI(axios.create({ baseURL }));

const email = process.env.API_TEST_EMAIL;
const password = process.env.API_TEST_PASSWORD;

(email && password ? describe : describe.skip)("note field contract", () => {
  let accessToken = "";
  let petId = "";
  const created: string[] = [];

  const signedIn = () => ({ headers: { Authorization: `Bearer ${accessToken}` } });

  const createNote = async (dto: { title?: string; content?: string }) => {
    const response = await bare.postApiPetsPetIdNotes(petId, dto, signedIn());
    if (response.data.id) created.push(response.data.id);
    return response;
  };

  const statusAndCode = async (request: Promise<unknown>) => {
    try {
      await request;
      return { status: 200, code: null };
    } catch (error) {
      if (!axios.isAxiosError(error) || !error.response) throw error;
      return { status: error.response.status, code: getApiError(error).code };
    }
  };

  beforeAll(async () => {
    const auth = await bare.postApiAuthLogin({ email: email ?? "", password: password ?? "" });
    accessToken = auth.data.accessToken ?? "";
    const pets = await bare.getApiPets(signedIn());
    petId = pets.data[0]?.id ?? "";
    if (!petId) throw new Error("The test account owns no pets; these cases need one.");
  });

  afterAll(async () => {
    for (const noteId of created.splice(0)) {
      await bare.deleteApiPetsPetIdNotesNoteId(petId, noteId, signedIn()).catch(() => undefined);
    }
  });

  it("accepts a note with a blank title", async () => {
    const response = await createNote({ title: "", content: "Bring vaccine record" });
    expect(response.status).toBe(201);
    // The server normalises a blank field to null, which NoteResponseDto types as string.
    expect(response.data.title).toBeNull();
  });

  it("accepts a note with blank content", async () => {
    const response = await createNote({ title: "Vet visit", content: "" });
    expect(response.status).toBe(201);
    expect(response.data.content).toBeNull();
  });

  it("rejects a note that is blank in both fields", async () => {
    await expect(statusAndCode(createNote({ title: "", content: "" }))).resolves.toMatchObject({
      status: 400,
    });
  });

  it("clears a field when PATCH sends null", async () => {
    const { data: note } = await createNote({ title: "Vet visit", content: "Bring the leash" });

    const patched = await bare.patchApiPetsPetIdNotesNoteId(
      petId,
      note.id ?? "",
      { content: null },
      signedIn()
    );

    expect(patched.data.content).toBeNull();
  });
});
