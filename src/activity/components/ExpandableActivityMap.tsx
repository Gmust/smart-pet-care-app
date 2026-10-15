import { type ComponentProps, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Platform, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { CrossIcon } from "@/icons/cross";
import { MaximizeIcon } from "@/icons/maximize";
import { Button } from "@/shadecn/ui/button";
import { useDrawerNativeActivity } from "@/shadecn/ui/drawer";
import { Text } from "@/shadecn/ui/text";

import { ActivityMap } from "./ActivityMap";

type Props = ComponentProps<typeof ActivityMap>;

// Inside a bottom sheet, panning a map fights the sheet's own drag, so the small
// map is a static preview. A tap opens it full screen, where it pans, zooms and,
// when onMapClick is set, places the pin.
export const ExpandableActivityMap = ({ style, onMapClick, onMarkerClick, ...mapProps }: Props) => {
  const { t } = useTranslation(["activity", "common"]);
  const { theme } = useUnistyles();

  const [isOpen, setIsOpen] = useState(false);

  const endNativeActivityRef = useRef<(() => void) | undefined>(undefined);

  const beginNativeActivity = useDrawerNativeActivity();

  const open = () => {
    // On Android the modal's window steals focus and collapses an enclosing
    // drawer; marking it as a native activity makes the drawer re-present.
    if (Platform.OS === "android") endNativeActivityRef.current = beginNativeActivity?.();
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    endNativeActivityRef.current?.();
    endNativeActivityRef.current = undefined;
  };

  // Unmounting while open must not leave the drawer waiting on the activity forever.
  useEffect(() => () => endNativeActivityRef.current?.(), []);

  return (
    <>
      <View style={[styles.preview, style]}>
        <ActivityMap {...mapProps} style={styles.fill} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("activity:map.expand")}
          style={styles.overlay}
          onPress={open}
        >
          <View style={styles.expandBadge}>
            <MaximizeIcon
              width={theme.iconSize.lg}
              height={theme.iconSize.lg}
              color={theme.palette.brand.primaryDark}
            />
          </View>
        </Pressable>
      </View>

      <Modal
        visible={isOpen}
        animationType="slide"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={close}
      >
        <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
          <View style={styles.header}>
            <Text variant="titleM" style={styles.title}>
              {t("activity:map.fullscreenTitle")}
            </Text>
            <Button
              size="icon"
              variant="icon"
              accessibilityLabel={t("common:actions.close")}
              onPress={close}
            >
              <CrossIcon
                width={theme.iconSize["2xl"]}
                height={theme.iconSize["2xl"]}
                color={theme.palette.brand.primaryDark}
              />
            </Button>
          </View>

          <ActivityMap
            {...mapProps}
            style={styles.fullMap}
            onMapClick={onMapClick}
            onMarkerClick={onMarkerClick}
          />

          {!!onMapClick && (
            <View style={styles.footer}>
              <Text variant="caption" style={styles.hint}>
                {t("activity:map.pickHint")}
              </Text>
              <Button size="lg" variant="primary" onPress={close}>
                {t("activity:map.done")}
              </Button>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create((theme) => ({
  preview: {
    overflow: "hidden",
    borderRadius: theme.borderRadius["2xl"],
  },
  fill: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "flex-end",
    padding: theme.spacing(2),
  },
  expandBadge: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.white,
  },
  screen: {
    flex: 1,
    backgroundColor: theme.palette.brand.surfacePage,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(2),
  },
  title: {
    flex: 1,
    color: theme.palette.brand.textBody,
  },
  fullMap: {
    flex: 1,
    borderRadius: 0,
  },
  footer: {
    gap: theme.spacing(2),
    padding: theme.spacing(4),
  },
  hint: {
    textAlign: "center",
    color: theme.palette.brand.textSecondary,
  },
}));
