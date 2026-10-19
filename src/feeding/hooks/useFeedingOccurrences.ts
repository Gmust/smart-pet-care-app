import dayjs from "dayjs";

import { useGetReminderOccurrences } from "@/reminders/queries/useGetReminderOccurrences";

import { DEFAULT_RANGE_DAYS } from "../constants";

export const useFeedingOccurrences = (petId: string | undefined) => {
  return useGetReminderOccurrences({
    petId,
    from: dayjs().subtract(DEFAULT_RANGE_DAYS, "day").startOf("day").toISOString(),
    to: dayjs().endOf("day").toISOString(),
  });
};
