/// <reference types="jest" />

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import type { AxiosResponse } from "axios";
import { AxiosError, AxiosHeaders } from "axios";

import { getApiPetsPetIdWellnessEvaluation } from "@/api";
import {
  ClassifierWellnessBand,
  ClassifierWellnessReasonCode,
  ClassifierWellnessScoreStatus,
  type WellnessResponseDto,
} from "@/api/generated";

import { useWellnessQuery } from "./useWellnessQuery";

jest.mock("@/api", () => ({
  getApiPetsPetIdWellnessEvaluation: jest.fn(),
}));

const evaluationMock = jest.mocked(getApiPetsPetIdWellnessEvaluation);

const PET_ID = "pet-1";

const wellness: WellnessResponseDto = {
  wellnessScore: 78,
  band: ClassifierWellnessBand.GOOD,
  scoreStatus: ClassifierWellnessScoreStatus.COMPLETE,
  states: {
    activity: ClassifierWellnessReasonCode.ACTIVITY_TARGET_MET,
    sleep: ClassifierWellnessReasonCode.SLEEP_WITHIN_RANGE,
    diet: ClassifierWellnessReasonCode.DIET_TRACKING_STRONG,
    symptoms: ClassifierWellnessReasonCode.SYMPTOMS_NOT_REPORTED,
    preventiveCare: ClassifierWellnessReasonCode.PREVENTIVE_CARE_CURRENT,
    baseline: ClassifierWellnessReasonCode.BASELINE_STABLE,
  },
  narrative: "Doing well.",
  recommendations: [],
  reminderSuggestions: [],
  disclaimer: "Not veterinary advice.",
};

const axiosOk = <T,>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: "OK",
  headers: {},
  config: { headers: new AxiosHeaders() },
});

const axiosFailure = (status: number) => {
  const error = new AxiosError("request failed", "ERR_BAD_REQUEST");
  error.response = {
    data: {},
    status,
    statusText: "",
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
};

const clients: QueryClient[] = [];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { gcTime: Infinity, retry: false },
      mutations: { gcTime: Infinity, retry: false },
    },
  });
  clients.push(queryClient);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper };
};

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // Without this a cached query keeps React Query's notify timer alive and jest
  // never exits (the suite hangs rather than failing).
  for (const client of clients.splice(0)) {
    client.clear();
  }
});

describe("useWellnessQuery", () => {
  it("returns the score for a pet that has one", async () => {
    evaluationMock.mockResolvedValue(axiosOk(wellness));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useWellnessQuery(PET_ID), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(evaluationMock).toHaveBeenCalledWith(PET_ID);
    expect(result.current.data).toEqual(wellness);
  });

  it("treats 404 as no score yet, not an error", async () => {
    // mockImplementation over mockRejectedValue: the latter builds the rejected
    // promise eagerly and surfaces as an unhandled rejection in the next test.
    evaluationMock.mockImplementation(() => Promise.reject(axiosFailure(404)));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useWellnessQuery(PET_ID), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeNull();
    expect(result.current.isError).toBe(false);
  });

  it("treats 422 (measurement conditions not met) as no score yet", async () => {
    evaluationMock.mockImplementation(() => Promise.reject(axiosFailure(422)));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useWellnessQuery(PET_ID), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeNull();
  });

  it("does not refetch a failed evaluation on every mount", async () => {
    // The home carousel mounts one card per pet; refetching errors on mount
    // turns a 429 into a burst of parallel calls on each visit.
    evaluationMock.mockImplementation(() => Promise.reject(axiosFailure(429)));
    const { wrapper } = createWrapper();

    const first = renderHook(() => useWellnessQuery(PET_ID), { wrapper });
    await waitFor(() => expect(first.result.current.isError).toBe(true));
    first.unmount();

    const second = renderHook(() => useWellnessQuery(PET_ID), { wrapper });

    expect(second.result.current.isError).toBe(true);
    expect(evaluationMock).toHaveBeenCalledTimes(1);
  });

  it("still reports a server failure as an error", async () => {
    // A 500 must not be swallowed into the same empty state as a 404 — that
    // would show every pet "no score yet" during an outage.
    evaluationMock.mockImplementation(() => Promise.reject(axiosFailure(500)));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useWellnessQuery(PET_ID), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
  });

  it("stays disabled and issues no request without a pet id", async () => {
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useWellnessQuery(undefined), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(evaluationMock).not.toHaveBeenCalled();
  });
});
