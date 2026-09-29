import { useEffect } from "react";
import { usePathname } from "expo-router";

import { queryClient } from "@/api/queryClient";

// Emits `[perf]` lines to logcat (tag ReactNativeJS) for scripts/perf.sh.
// console.warn on purpose: release builds strip console.log (see babel.config.js).
// Only mounted when EXPO_PUBLIC_PERF_LOG=1 (see src/app/_layout.tsx).
const mark = (event: string, detail: string) =>
  console.warn(`[perf] ${event} ${detail} t=${performance.now().toFixed(0)}`);

export const PerfLogger = () => {
  const pathname = usePathname();

  useEffect(() => {
    mark("route", pathname);
  }, [pathname]);

  useEffect(() => {
    const unsubscribeQueries = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== "updated") return;
      const { type } = event.action;
      if (type === "fetch" || type === "success" || type === "error") {
        mark(`query:${type}`, JSON.stringify(event.query.queryKey));
      }
    });
    const unsubscribeMutations = queryClient.getMutationCache().subscribe((event) => {
      if (event.type !== "updated") return;
      const { type } = event.action;
      if (type === "pending" || type === "success" || type === "error") {
        mark(`mutation:${type}`, JSON.stringify(event.mutation.options.mutationKey ?? "unkeyed"));
      }
    });
    return () => {
      unsubscribeQueries();
      unsubscribeMutations();
    };
  }, []);

  return null;
};
