import { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";

import { ReminderStatusDrawer } from "@/reminders/components/ReminderStatusDrawer";

export function ReminderStatusPrompt() {
  const lastResponse = Notifications.useLastNotificationResponse();
  const [target, setTarget] = useState<{ reminderId: string; runId?: string } | null>(null);
  const handledIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lastResponse) return;

    const request = lastResponse.notification.request;
    if (handledIdRef.current === request.identifier) return;

    const data = request.content.data;
    const nextReminderId = typeof data?.reminderId === "string" ? data.reminderId : null;
    if (!nextReminderId) return;

    // `runId` is only present once the API attaches the reminder run to the push
    // payload; without it the drawer simply skips acknowledging the run.
    const nextRunId = typeof data?.runId === "string" ? data.runId : undefined;

    handledIdRef.current = request.identifier;
    setTarget({ reminderId: nextReminderId, runId: nextRunId });
    void Notifications.clearLastNotificationResponseAsync();
  }, [lastResponse]);

  if (!target) return null;

  return (
    <ReminderStatusDrawer
      reminderId={target.reminderId}
      runId={target.runId}
      onClose={() => setTarget(null)}
      markMissedOnDismiss
    />
  );
}
