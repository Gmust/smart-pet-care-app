import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";

import { PetPickerDrawer } from "@/activity/components/drawers/PetPickerDrawer";
import { LogWeightDrawer } from "@/feeding/components/drawers/LogWeightDrawer";
import { MicIcon } from "@/icons/mic";
import { usePetsQuery } from "@/pets/queries/usePetsQuery";

import { useVoiceRecognition } from "../hooks/useVoiceRecognition";
import type { VoiceCommand, VoiceFailure } from "../types";
import { parseVoiceCommand } from "../utils/parseVoiceCommand";

import { VoiceCommandDrawer } from "./VoiceCommandDrawer";

const SPEECH_OPTIONS = { language: "en-US" };

// Matches the "+" FAB beside it (see Fab.tsx), so the two sit on one line above the tab bar.
const BUTTON_SIZE = 56;
const BAR_CLEARANCE = 80;

/**
 * Push-to-talk on Home: listens for one phrase, turns it into a command and opens the screen
 * that command belongs to, already filled in. Nothing is saved until the user confirms there.
 *
 * Loaded through `VoiceCommandEntry`, never imported directly — see the note there.
 */
export default function VoiceCommandButton() {
  const { t } = useTranslation(["voice"]);
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: pets } = usePetsQuery();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [failure, setFailure] = useState<VoiceFailure | null>(null);
  // A command that named no pet while the user has several, waiting on the picker.
  const [pendingCommand, setPendingCommand] = useState<VoiceCommand | null>(null);
  // Held in state so the weight drawer gets the same prefill object on every render.
  const [weightEntry, setWeightEntry] = useState<{
    petId: string;
    prefill: { weightKg: string };
  } | null>(null);

  const runCommand = (command: VoiceCommand, petId: string) => {
    const name = pets?.find((pet) => pet.id === petId)?.name ?? "";

    if (command.action === "logWeight") {
      setWeightEntry({ petId, prefill: { weightKg: command.weightKg } });
      Speech.speak(
        command.weightKg
          ? t("voice:speech.weight", { weight: command.weightKg, name })
          : t("voice:speech.weightNoValue", { name }),
        SPEECH_OPTIONS
      );
      return;
    }

    router.push({
      pathname: "/(tabs)/pets/note",
      params: { petId, ...(command.content ? { draft: command.content } : {}) },
    });
    Speech.speak(t("voice:speech.note", { name }), SPEECH_OPTIONS);
  };

  const recognition = useVoiceRecognition({
    contextualStrings: (pets ?? []).flatMap((pet) => (pet.name ? [pet.name] : [])),
    onTranscript: (transcript) => {
      const result = parseVoiceCommand(transcript, pets ?? []);
      if (result.kind === "unrecognized") {
        setFailure("unrecognized");
        Speech.speak(t("voice:speech.unrecognized"), SPEECH_OPTIONS);
        return;
      }

      setIsVoiceOpen(false);
      if (result.command.petId) {
        runCommand(result.command, result.command.petId);
        return;
      }
      setPendingCommand(result.command);
      Speech.speak(t("voice:speech.whichPet"), SPEECH_OPTIONS);
    },
    onFailure: setFailure,
  });

  const listen = () => {
    // The app's own voice would otherwise be transcribed as the user's next command.
    void Speech.stop();
    setFailure(null);
    void recognition.start();
  };

  // Every command acts on a pet; with none yet the "+" FAB leads to creating one.
  if (!pets?.length) return null;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("voice:button.a11y")}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setIsVoiceOpen(true);
          listen();
        }}
        style={({ pressed }) => [
          styles.button,
          { bottom: insets.bottom + BAR_CLEARANCE },
          pressed && styles.pressed,
        ]}
      >
        <MicIcon
          width={theme.iconSize["2xl"]}
          height={theme.iconSize["2xl"]}
          color={theme.palette.brand.primaryDefault}
        />
      </Pressable>

      <VoiceCommandDrawer
        isOpen={isVoiceOpen}
        onOpenChange={(open) => {
          if (open) return;
          // Closing mid-sentence must not run whatever the recognizer finishes hearing.
          recognition.abort();
          setIsVoiceOpen(false);
        }}
        isListening={recognition.isListening}
        transcript={recognition.transcript}
        failure={failure}
        onDone={recognition.stop}
        onRetry={listen}
      />

      <PetPickerDrawer
        isOpen={!!pendingCommand}
        setIsOpen={(open) => {
          if (!open) setPendingCommand(null);
        }}
        pets={pets}
        selectedPetId={undefined}
        onSelect={(petId) => {
          if (pendingCommand) runCommand(pendingCommand, petId);
        }}
      />

      {!!weightEntry && (
        <LogWeightDrawer
          isOpen
          setIsOpen={(open) => {
            if (!open) setWeightEntry(null);
          }}
          petId={weightEntry.petId}
          prefill={weightEntry.prefill}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  button: {
    position: "absolute",
    right: theme.spacing(4) + BUTTON_SIZE + theme.spacing(3),
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.brand.primaryXsoft,
    shadowColor: theme.palette.brand.primaryDefault,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  pressed: {
    opacity: 0.9,
  },
}));
