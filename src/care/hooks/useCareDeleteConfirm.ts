import { useState } from "react";

export function useCareDeleteConfirm<T>() {
  const [pendingItem, setPendingItem] = useState<T | null>(null);

  return {
    pendingItem,
    isOpen: pendingItem !== null,
    request: (item: T) => setPendingItem(item),
    close: () => setPendingItem(null),
  };
}
