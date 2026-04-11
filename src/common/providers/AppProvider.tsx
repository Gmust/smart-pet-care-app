import React, { ReactNode, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useRouter } from "expo-router";

interface AppProviderProps {
  children: ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  const { replace: _replace } = useRouter();

  const _readyRef = useRef(false);

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={new QueryClient()}>
        {children}
        <PortalHost />
        <PortalHost name="dialog" />
        <PortalHost name="popover" />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
