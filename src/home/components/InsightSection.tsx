import { useState } from "react";
import { useRouter } from "expo-router";

import { InsightSectionSkeleton } from "../skeletons/HomePageSkeleton";
import type { AiInsight } from "../types";

import { AiInsightCard } from "./AiInsightCard";

//TODO add functional when Backend would be ready
export function InsightSection() {
  const router = useRouter();
  const [showInsight, setShowInsight] = useState(true);

  if (!showInsight) {
    return <InsightSectionSkeleton />;
  }

  return (
    <AiInsightCard
      insight={{ timeAgo: new Date(), message: "" } satisfies AiInsight}
      onAsk={() => router.push("../assistant")}
      onDismiss={() => setShowInsight(false)}
    />
  );
}
