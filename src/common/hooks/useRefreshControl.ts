import { useState } from "react";

// `isRefreshing` turns on in the same tick as the pull: on Android a control whose `refreshing` is
// still false at release hides its spinner and shows it a frame later, which reads as a jerk. A
// failed refresh still ends it.
export const useRefreshControl = (refresh: () => Promise<unknown>) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return { isRefreshing, onRefresh };
};
