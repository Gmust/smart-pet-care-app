import { z } from "zod";

import { toApiNumber } from "../utils/toApiNumber";

export const isPositiveDecimal = (value: string) =>
  /^\d+([.,]\d+)?$/.test(value) && (toApiNumber(value) ?? 0) > 0;

export const optionalPositiveNumber = (message: string) =>
  z.string().refine((value) => {
    const trimmed = value.trim();
    if (trimmed === "") return true;
    return isPositiveDecimal(trimmed);
  }, message);
