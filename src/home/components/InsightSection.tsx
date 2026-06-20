import { useState } from "react";

import { InsightSectionSkeleton } from "../skeletons/HomePageSkeleton";
import type { AiInsight } from "../types";
import { AiInsightCard } from "./AiInsightCard";

//TODO add functional when Backend would be ready
export function InsightSection() {
  const [showInsight, setShowInsight] = useState(true);

  if (!showInsight) {
    return <InsightSectionSkeleton />;
  }

  return (
    <AiInsightCard insight={null as unknown as AiInsight} onDismiss={() => setShowInsight(false)} />
  );
}
