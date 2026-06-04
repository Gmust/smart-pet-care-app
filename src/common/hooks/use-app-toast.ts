import { useCallback } from "react";
import Toast from "react-native-toast-message";

import type { AppToastVariant } from "@/common/components/app-toast";

interface AppToastOptions {
  duration?: number;
}

const toastCopy: Record<AppToastVariant, { title: string; fallback: string }> = {
  success: {
    title: "Saved",
    fallback: "Care profile changes were saved.",
  },
  error: {
    title: "Needs attention",
    fallback: "We could not complete that action.",
  },
  warning: {
    title: "Reminder",
    fallback: "Double-check the details before continuing.",
  },
  info: {
    title: "Update",
    fallback: "Your pet care dashboard is up to date.",
  },
};

export function useAppToast() {
  const showAppToast = useCallback(
    (variant: AppToastVariant, message?: string, options: AppToastOptions = {}) => {
      const copy = toastCopy[variant];

      Toast.show({
        type: variant,
        text1: copy.title,
        text2: message ?? copy.fallback,
        visibilityTime: options.duration ?? 3200,
        position: "top",
        topOffset: 60,
      });
    },
    []
  );

  return {
    showSuccess: (message?: string, options?: AppToastOptions) =>
      showAppToast("success", message, options),
    showError: (message?: string, options?: AppToastOptions) =>
      showAppToast("error", message, options),
    showWarning: (message?: string, options?: AppToastOptions) =>
      showAppToast("warning", message, options),
    showInfo: (message?: string, options?: AppToastOptions) =>
      showAppToast("info", message, options),
  };
}
