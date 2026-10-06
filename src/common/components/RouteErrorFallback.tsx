import { useEffect } from "react";
import type { ErrorBoundaryProps } from "expo-router";

import { QueryErrorState } from "./QueryErrorState";

// Shared fallback for Expo Router route ErrorBoundary exports.
export function RouteErrorFallback({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Route render error:", error);
  }, [error]);

  return <QueryErrorState onRetry={retry} />;
}
