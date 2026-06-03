import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { HeartPulseIcon } from "@/icons/heart";

import { aiInsight } from "../data";
import type { TimelineEvent } from "../types";
import { AiInsightCard } from "./AiInsightCard";

type InsightSectionProps = {
  onAddEvent: (event: TimelineEvent) => void;
  onStatusChange: (message: string) => void;
};

export function InsightSection({ onAddEvent, onStatusChange }: InsightSectionProps) {
  const { t } = useTranslation(["home"]);
  const [showInsight, setShowInsight] = useState(true);

  const handleAskAssistant = useCallback(() => {
    onStatusChange(t("mockStatus.assistantOpened"));
    onAddEvent({
      id: `assistant-${Date.now()}`,
      icon: HeartPulseIcon,
      title: t("mockEvents.assistant.title"),
      meta: t("mockEvents.justNow"),
      dot: "primary",
    });
  }, [onAddEvent, onStatusChange, t]);

  const handleDismissInsight = useCallback(() => {
    setShowInsight(false);
    onStatusChange(t("mockStatus.insightDismissed"));
  }, [onStatusChange, t]);

  if (!showInsight) {
    return null;
  }

  return (
    <AiInsightCard
      insight={aiInsight}
      onAsk={handleAskAssistant}
      onDismiss={handleDismissInsight}
    />
  );
}
