import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { type Href, useRouter } from "expo-router";

import { useIsOnline } from "@/common/hooks/useIsOnline";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";

import { BackButton } from "./BackButton";
import { OfflineScreen } from "./OfflineScreen";

type Props = {
  onRetry: () => void;
  /** Where to go when there is no history to pop — a screen opened by deep
   * link or a push has none, and would otherwise be a dead end. */
  fallbackHref?: Href;
};

// Shared fallback for a failed query (isError), as opposed to
// RouteErrorFallback, which catches JS render errors via ErrorBoundary.
export const QueryErrorState = ({ onRetry, fallbackHref }: Props) => {
  const { t } = useTranslation(["common"]);
  const isOnline = useIsOnline();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const canGoBack = router.canGoBack();

  const handleBack = () => {
    if (canGoBack) {
      router.back();
      return;
    }
    if (fallbackHref) {
      router.replace(fallbackHref);
    }
  };

  return (
    <View style={styles.root}>
      {/* Stack screens draw their own header (headerShown: false). */}
      {canGoBack || fallbackHref ? (
        <View style={[styles.topBar, styles.topBarInset(insets.top)]}>
          <BackButton onBackPress={handleBack} />
        </View>
      ) : null}

      {isOnline ? (
        <View style={styles.content}>
          <Text variant="titleL" style={styles.title}>
            {t("errors.somethingWentWrong")}
          </Text>
          <Text variant="body" style={styles.description}>
            {t("errors.screenErrorDescription")}
          </Text>
          <Button
            variant="primary"
            size="md"
            accessibilityLabel={t("errors.tryAgain")}
            style={styles.retryButton}
            onPress={onRetry}
          >
            {t("errors.tryAgain")}
          </Button>
        </View>
      ) : (
        <OfflineScreen onReconnected={onRetry} />
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.palette.brand.surfacePage,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing(4),
  },
  topBarInset: (topInset: number) => ({ paddingTop: topInset + theme.spacing(2) }),
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(3),
    paddingHorizontal: theme.spacing(6),
  },
  title: {
    color: theme.palette.brand.textBody,
    textAlign: "center",
  },
  description: {
    color: theme.palette.brand.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    width: "100%",
    marginTop: theme.spacing(2),
  },
}));
