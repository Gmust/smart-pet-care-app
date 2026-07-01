import { useEffect, useRef, useState } from "react";

import { ReminderStatusDrawer } from "@/reminders/components/ReminderStatusDrawer";

import * as Notifications from "expo-notifications";

export function ReminderStatusPrompt() {
  const lastResponse = Notifications.useLastNotificationResponse();
  const [reminderId, setReminderId] = useState<string | null>(null);
  const handledIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lastResponse) return;

    const request = lastResponse.notification.request;
    if (handledIdRef.current === request.identifier) return;

    const data = request.content.data;
    const nextReminderId = typeof data?.reminderId === "string" ? data.reminderId : null;
    if (!nextReminderId) return;

    handledIdRef.current = request.identifier;
    setReminderId(nextReminderId);
  }, [lastResponse]);

  if (!reminderId) return null;

  return (
    <ReminderStatusDrawer
      reminderId={reminderId}
      onClose={() => setReminderId(null)}
      markMissedOnDismiss
    />
  );
}
