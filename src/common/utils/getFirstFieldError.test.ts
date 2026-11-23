/// <reference types="jest" />

import { getFirstFieldError } from "./getFirstFieldError";

describe("getFirstFieldError", () => {
  it("reads the message of a schema issue, or a plain string", () => {
    expect(getFirstFieldError([{ message: "Enter a name", path: ["name"] }])).toBe("Enter a name");
    expect(getFirstFieldError(["Required"])).toBe("Required");
  });

  it("skips entries without a text message and returns nothing when there is none", () => {
    expect(
      getFirstFieldError([undefined, { code: "x" }, { message: 4 }, { message: "Later" }])
    ).toBe("Later");
    expect(getFirstFieldError([])).toBeUndefined();
  });
});
