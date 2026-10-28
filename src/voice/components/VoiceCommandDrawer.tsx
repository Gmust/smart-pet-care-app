import { useTranslation } from "react-i18next";
import { Linking, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { MicIcon } from "@/icons/mic";
import { Button } from "@/shadecn/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shadecn/ui/drawer";
import { Text } from "@/shadecn/ui/text";

import type { VoiceFailure } from "../types";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isListening: boolean;
  transcript: string;
  failure: VoiceFailure | null;
  onDone: () => void;
  onRetry: () => void;
};

export const VoiceCommandDrawer = ({
  isOpen,
  onOpenChange,
  isListening,
  transcript,
  failure,
  onDone,
  onRetry,
}: Props) => {
  const { t } = useTranslation(["voice"]);
  const { theme } = useUnistyles();

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent snapPoints={["48%"]} enableDynamicSizing={false}>
        <DrawerHeader>
          <DrawerTitle>
            {failure
              ? t(`voice:drawer.failures.${failure}.title`)
              : t("voice:drawer.listeningTitle")}
          </DrawerTitle>
        </DrawerHeader>

        <View style={styles.body}>
          <View style={[styles.mic, isListening && styles.micActive]}>
            <MicIcon
              width={theme.iconSize["3xl"]}
              height={theme.iconSize["3xl"]}
              color={
                isListening ? theme.palette.brand.textOnDark : theme.palette.brand.primaryDefault
              }
            />
          </View>
          {!!transcript && (
            <Text variant="bodySemiBold" style={styles.transcript}>
              {t("voice:drawer.heard", { transcript })}
            </Text>
          )}
          <Text variant="bodyS" style={styles.hint}>
            {failure ? t(`voice:drawer.failures.${failure}.body`) : t("voice:drawer.listeningHint")}
          </Text>
        </View>

        <DrawerFooter style={styles.footer}>
          {failure === "notAllowed" && (
            <Button
              variant="secondary"
              onPress={() => {
                void Linking.openSettings();
              }}
            >
              {t("voice:drawer.openSettings")}
            </Button>
          )}
          {failure ? (
            <Button variant="primary" onPress={onRetry}>
              {t("voice:drawer.tryAgain")}
            </Button>
          ) : (
            <Button variant="primary" disabled={!isListening} onPress={onDone}>
              {t("voice:drawer.done")}
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

const styles = StyleSheet.create((theme) => ({
  body: {
    alignItems: "center",
    gap: theme.spacing(3),
    paddingTop: theme.spacing(4),
    paddingHorizontal: theme.spacing(2),
  },
  mic: {
    width: theme.spacing(18),
    height: theme.spacing(18),
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.brand.primaryXsoft,
  },
  micActive: {
    backgroundColor: theme.palette.brand.primaryDefault,
  },
  transcript: {
    textAlign: "center",
    color: theme.palette.brand.textPrimary,
  },
  hint: {
    textAlign: "center",
    color: theme.palette.brand.textSecondary,
  },
  footer: {
    gap: theme.spacing(2),
    paddingTop: theme.spacing(1),
    backgroundColor: theme.palette.transparent,
  },
}));
