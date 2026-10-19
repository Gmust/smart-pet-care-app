import type { Dispatch, SetStateAction } from "react";

import type { FeedingLogResponseDto } from "@/api/generated";

import type { FeedingSlot } from "../types";

import { LogMealDrawer } from "./drawers/LogMealDrawer";

type MealDrawersProps = {
  petId: string | undefined;
  isCreateOpen: boolean;
  setIsCreateOpen: Dispatch<SetStateAction<boolean>>;
  editingLog: FeedingLogResponseDto | null;
  setEditingLog: Dispatch<SetStateAction<FeedingLogResponseDto | null>>;
  loggingSlot: FeedingSlot | null;
  setLoggingSlot: Dispatch<SetStateAction<FeedingSlot | null>>;
};

export const MealDrawers = ({
  petId,
  isCreateOpen,
  setIsCreateOpen,
  editingLog,
  setEditingLog,
  loggingSlot,
  setLoggingSlot,
}: MealDrawersProps) => {
  if (!petId) return null;

  return (
    <>
      <LogMealDrawer isOpen={isCreateOpen} setIsOpen={setIsCreateOpen} petId={petId} />
      {!!loggingSlot && (
        <LogMealDrawer
          key={`${loggingSlot.reminderId}-${loggingSlot.fedAt}`}
          isOpen
          setIsOpen={(open) => {
            if (!open) setLoggingSlot(null);
          }}
          petId={petId}
          slot={loggingSlot}
        />
      )}
      {!!editingLog && (
        <LogMealDrawer
          key={editingLog.id}
          isOpen
          setIsOpen={(open) => {
            if (!open) setEditingLog(null);
          }}
          petId={petId}
          log={editingLog}
        />
      )}
    </>
  );
};
