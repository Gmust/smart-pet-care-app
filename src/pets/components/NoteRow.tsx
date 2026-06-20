import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { ChevronRightIcon } from "@/icons/chevron-right";
import { PencilLineIcon } from "@/icons/pencil-line";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import type { PetNote } from "../types";

type NoteRowProps = {
  note: PetNote;
};

const NOTE_ICON_SIZE = 16;
const CHEVRON_ICON_SIZE = 18;

export function NoteRow({ note }: NoteRowProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={note.title} style={styles.noteRow}>
      <View style={styles.noteIconBg}>
        <PencilLineIcon
          width={NOTE_ICON_SIZE}
          height={NOTE_ICON_SIZE}
          color={palette.brand.textBody}
        />
      </View>
      <View style={styles.noteTexts}>
        <Text style={styles.noteTitle}>{note.title}</Text>
        <Text style={styles.notePreview} numberOfLines={1}>
          {note.preview}
        </Text>
      </View>
      <ChevronRightIcon
        width={CHEVRON_ICON_SIZE}
        height={CHEVRON_ICON_SIZE}
        color={palette.brand.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  noteRow: {
    minHeight: theme.spacing(14.5),
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
    borderTopWidth: 1,
    borderTopColor: theme.palette.brand.surfaceBorder,
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
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    lineHeight: theme.fontSize.xs * 1.4,
    color: theme.palette.brand.textPrimary,
  },
  notePreview: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    lineHeight: theme.fontSize.xs * 1.4,
    color: theme.palette.brand.textSecondary,
  },
}));
