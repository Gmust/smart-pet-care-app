import { z } from "zod";

import { toApiNumber } from "../utils/toApiNumber";

export const isPositiveDecimal = (value: string) =>
  /^\d+([.,]\d+)?$/.test(value) && (toApiNumber(value) ?? 0) > 0;

export const optionalWholeNumber = (message: string) =>
  z.string().refine((value) => {
    const trimmed = value.trim();
    if (trimmed === "") return true;
    return /^\d+$/.test(trimmed);
  }, message);

export const optionalPositiveWholeNumber = (message: string) =>
  z.string().refine((value) => {
    const trimmed = value.trim();
    if (trimmed === "") return true;
    return /^\d+$/.test(trimmed) && Number(trimmed) > 0;
  }, message);

export const optionalPositiveNumber = (message: string) =>
  z.string().refine((value) => {
    const trimmed = value.trim();
    if (trimmed === "") return true;
    return isPositiveDecimal(trimmed);
  }, message);
