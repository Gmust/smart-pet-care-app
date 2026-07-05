import { useSyncExternalStore } from "react";
import { onlineManager } from "@tanstack/react-query";

export function useIsOnline(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => onlineManager.subscribe(onStoreChange),
    () => onlineManager.isOnline()
  );
}
