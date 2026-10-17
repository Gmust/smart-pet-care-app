/// <reference types="jest" />

import { assessmentParamsSchema } from "./assessment-params.schema";

const PET_ID = "2464cb42-30db-4bbd-9bb6-9523f20fa329";

describe("assessmentParamsSchema", () => {
  it("opens on the requested tab", () => {
    expect(assessmentParamsSchema.parse({ petId: PET_ID, tab: "wellness" }).tab).toBe("wellness");
  });

  it("has no tab when none is asked for", () => {
    expect(assessmentParamsSchema.parse({ petId: PET_ID }).tab).toBeUndefined();
  });

  it("ignores an unknown tab instead of rejecting the whole link", () => {
    const result = assessmentParamsSchema.safeParse({ petId: PET_ID, tab: "nonsense" });

    expect(result.success).toBe(true);
    expect(result.data?.tab).toBeUndefined();
  });

  it("still rejects an id that is not a uuid, whatever the tab", () => {
    expect(assessmentParamsSchema.safeParse({ petId: "nope", tab: "wellness" }).success).toBe(
      false
    );
  });

  it("keeps where the screen was opened from, and ignores an unknown origin", () => {
    expect(assessmentParamsSchema.parse({ petId: PET_ID, from: "home" }).from).toBe("home");

    const result = assessmentParamsSchema.safeParse({ petId: PET_ID, from: "elsewhere" });

    expect(result.success).toBe(true);
    expect(result.data?.from).toBeUndefined();
  });
});
