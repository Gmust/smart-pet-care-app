import React, { useRef, useState } from "react";
import type { ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { toastConfig } from "@/common/components/app-toast";

import { useRouter } from "expo-router";

interface AppProviderProps {
  children: ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  const { replace: _replace } = useRouter();

  const _readyRef = useRef(false);
  const [queryClient] = useState(() => new QueryClient());

  return (
    <GestureHandlerRootView>
      <BottomSheetModalProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <PortalHost />
          <PortalHost name="dialog" />
          <PortalHost name="popover" />
        </QueryClientProvider>
      </BottomSheetModalProvider>
      <Toast config={toastConfig} />
    </GestureHandlerRootView>
  );
}
