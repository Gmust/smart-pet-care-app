/// <reference types="jest" />

import { decodeActivityLocation, encodeActivityLocation } from "./activityLocation";

describe("encodeActivityLocation", () => {
  it("encodes a label with coordinates", () => {
    expect(
      encodeActivityLocation({
        label: "Riverside Park",
        coordinates: { latitude: 50.4501, longitude: 30.5234 },
      })
    ).toBe("Riverside Park@50.450100,30.523400");
  });

  it("encodes coordinates with no label", () => {
    expect(
      encodeActivityLocation({
        label: "",
        coordinates: { latitude: 50.4501, longitude: 30.5234 },
      })
    ).toBe("@50.450100,30.523400");
  });

  it("encodes a label with no coordinates as plain text", () => {
    expect(encodeActivityLocation({ label: "Riverside Park", coordinates: null })).toBe(
      "Riverside Park"
    );
  });

  it("returns null for a null location", () => {
    expect(encodeActivityLocation(null)).toBeNull();
  });

  it("returns null when there is neither a label nor coordinates", () => {
    expect(encodeActivityLocation({ label: "   ", coordinates: null })).toBeNull();
  });

  it("drops out-of-range coordinates rather than writing them", () => {
    expect(
      encodeActivityLocation({ label: "Nowhere", coordinates: { latitude: 91, longitude: 0 } })
    ).toBe("Nowhere");
    expect(
      encodeActivityLocation({ label: "Nowhere", coordinates: { latitude: 0, longitude: 181 } })
    ).toBe("Nowhere");
  });
});

describe("decodeActivityLocation", () => {
  it("round-trips a label with coordinates", () => {
    const original = {
      label: "Riverside Park",
      coordinates: { latitude: 50.4501, longitude: 30.5234 },
    };
    expect(decodeActivityLocation(encodeActivityLocation(original))).toEqual(original);
  });

  it("round-trips coordinates with no label", () => {
    const original = { label: "", coordinates: { latitude: -12.5, longitude: 130.25 } };
    expect(decodeActivityLocation(encodeActivityLocation(original))).toEqual(original);
  });

  it("keeps a label that itself contains @", () => {
    expect(decodeActivityLocation("Cafe @ The Park@50.450100,30.523400")).toEqual({
      label: "Cafe @ The Park",
      coordinates: { latitude: 50.4501, longitude: 30.5234 },
    });
  });

  it("treats plain text as a label with no coordinates", () => {
    expect(decodeActivityLocation("Riverside Park")).toEqual({
      label: "Riverside Park",
      coordinates: null,
    });
  });

  it("degrades a malformed suffix to the full string as a label", () => {
    expect(decodeActivityLocation("Park@not-a-coordinate")).toEqual({
      label: "Park@not-a-coordinate",
      coordinates: null,
    });
    expect(decodeActivityLocation("Park@50.4501")).toEqual({
      label: "Park@50.4501",
      coordinates: null,
    });
    expect(decodeActivityLocation("Park@50.4501,30.5234,99")).toEqual({
      label: "Park@50.4501,30.5234,99",
      coordinates: null,
    });
  });

  it("degrades a blank coordinate part instead of coercing it to zero", () => {
    expect(decodeActivityLocation("Park@,30.5234")).toEqual({
      label: "Park@,30.5234",
      coordinates: null,
    });
    expect(decodeActivityLocation("Park@50.4501,")).toEqual({
      label: "Park@50.4501,",
      coordinates: null,
    });
  });

  it("degrades out-of-range latitude", () => {
    expect(decodeActivityLocation("Park@91.000000,30.523400")).toEqual({
      label: "Park@91.000000,30.523400",
      coordinates: null,
    });
  });

  it("degrades out-of-range longitude", () => {
    expect(decodeActivityLocation("Park@50.450100,181.000000")).toEqual({
      label: "Park@50.450100,181.000000",
      coordinates: null,
    });
  });

  it("accepts the exact range boundaries", () => {
    expect(decodeActivityLocation("@-90.000000,-180.000000")).toEqual({
      label: "",
      coordinates: { latitude: -90, longitude: -180 },
    });
    expect(decodeActivityLocation("@90.000000,180.000000")).toEqual({
      label: "",
      coordinates: { latitude: 90, longitude: 180 },
    });
  });

  it("returns null for null, undefined, and blank input", () => {
    expect(decodeActivityLocation(null)).toBeNull();
    expect(decodeActivityLocation(undefined)).toBeNull();
    expect(decodeActivityLocation("")).toBeNull();
    expect(decodeActivityLocation("   ")).toBeNull();
  });

  it("never throws on arbitrary input", () => {
    const inputs = ["@@@", "@", ",", "@,", "NaN,NaN", "@NaN,NaN", "@Infinity,0"];
    for (const input of inputs) {
      expect(() => decodeActivityLocation(input)).not.toThrow();
    }
    expect(decodeActivityLocation("@Infinity,0")).toEqual({
      label: "@Infinity,0",
      coordinates: null,
    });
  });
});
