import type { ReactNode } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import Toast from "react-native-toast-message";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/api/queryClient";
import { toastConfig } from "@/common/components/AppToast";
import { installOnlineManager } from "@/common/utils/installOnlineManager";
import { PetListModeProvider } from "@/pets/providers/PetListModeProvider";

import { PetSelectionProvider } from "./PetSelectionProvider";

installOnlineManager();

interface AppProviderProps {
  children: ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <KeyboardProvider>
      <BottomSheetModalProvider>
        <QueryClientProvider client={queryClient}>
          <PetSelectionProvider>
            <PetListModeProvider>{children}</PetListModeProvider>
          </PetSelectionProvider>
        </QueryClientProvider>
      </BottomSheetModalProvider>
      <PortalHost />
      <PortalHost name="dialog" />
      <PortalHost name="popover" />
      <PortalHost name="select" />
      <PortalHost name="dropdown" />
      <Toast config={toastConfig} />
    </KeyboardProvider>
  );
}
