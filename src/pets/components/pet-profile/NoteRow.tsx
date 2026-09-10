import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { ChevronIcon } from "@/icons/chevron";
import { PencilLineIcon } from "@/icons/pencil-line";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import type { PetNote } from "../../types";

type NoteRowProps = {
  note: PetNote;
  onPress: () => void;
};

const NOTE_ICON_SIZE = 16;
const CHEVRON_ICON_SIZE = 18;

export const NoteRow = ({ note, onPress }: NoteRowProps) => {
  const { t } = useTranslation(["pets"]);

  const title = note.title.trim() || t("pets:singleNotePage.untitled");
  const preview = note.content.trim();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      style={styles.noteRow}
      onPress={onPress}
    >
      <View style={styles.noteIconBg}>
        <PencilLineIcon
          width={NOTE_ICON_SIZE}
          height={NOTE_ICON_SIZE}
          color={palette.brand.textBody}
        />
      </View>
      <View style={styles.noteTexts}>
        <Text
          variant="bodyS"
          style={note.title.trim() ? styles.noteTitle : styles.noteTitlePlaceholder}
        >
          {title}
        </Text>
        <Text variant="caption" style={styles.notePreview} numberOfLines={1}>
          {preview}
        </Text>
      </View>
      <ChevronIcon
        direction="right"
        width={CHEVRON_ICON_SIZE}
        height={CHEVRON_ICON_SIZE}
        color={palette.brand.textSecondary}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  noteRow: {
    minHeight: theme.spacing(14.5),
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: theme.spacing(2.75),
  },
  noteIconBg: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  noteTexts: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing(1),
  },
  noteTitle: {
    color: theme.palette.brand.textPrimary,
  },
  noteTitlePlaceholder: {
    color: theme.palette.brand.textSecondary,
  },
  notePreview: {
    color: theme.palette.brand.textSecondary,
  },
}));
