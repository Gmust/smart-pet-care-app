import type { ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import Toast from "react-native-toast-message";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/api/queryClient";
import { toastConfig } from "@/common/components/AppToast";

interface AppProviderProps {
  children: ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <GestureHandlerRootView>
      <KeyboardProvider>
        <BottomSheetModalProvider>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </BottomSheetModalProvider>
        <PortalHost />
        <PortalHost name="dialog" />
        <PortalHost name="popover" />
        <PortalHost name="select" />
        <PortalHost name="dropdown" />
        <Toast config={toastConfig} />
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
