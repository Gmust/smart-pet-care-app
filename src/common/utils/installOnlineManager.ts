import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";

let installed = false;

// Wires device connectivity into React Query so queries pause while offline
// and refetch automatically on reconnect (refetchOnReconnect).
export const installOnlineManager = (): void => {
  if (installed) return;
  installed = true;

  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) =>
      // Treat as online only when connected AND internet is reachable.
      // isInternetReachable is null while unknown — don't force offline then.
      setOnline(state.isConnected === true && state.isInternetReachable !== false)
    )
  );
};
