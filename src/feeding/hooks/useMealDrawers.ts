import { useState } from "react";

import type { FeedingLogResponseDto } from "@/api/generated";

import type { FeedingSlot } from "../types";

export const useMealDrawers = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<FeedingLogResponseDto | null>(null);
  const [loggingSlot, setLoggingSlot] = useState<FeedingSlot | null>(null);

  return {
    openCreate: () => setIsCreateOpen(true),
    editLog: setEditingLog,
    logSlot: setLoggingSlot,
    drawerProps: {
      isCreateOpen,
      setIsCreateOpen,
      editingLog,
      setEditingLog,
      loggingSlot,
      setLoggingSlot,
    },
  };
};
