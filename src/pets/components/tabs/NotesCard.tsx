import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Card } from "@/shadecn/ui/card";
import { Text } from "@/shadecn/ui/text";

import type { PetNote } from "../../types";
import { NoteRow } from "../pet-profile/NoteRow";

type Props = {
  notes: PetNote[];
  onOpenNote: (noteId?: string) => void;
};

const MAX_VISIBLE_NOTE_ROWS = 5;

export const NotesCard = ({ notes, onOpenNote }: Props) => {
  const { t } = useTranslation(["pets"]);

  const noteRows = notes.map((note, index) => (
    <View key={note.id} style={index > 0 ? styles.rowDivider : undefined}>
      <NoteRow note={note} onPress={() => onOpenNote(note.id)} />
    </View>
  ));

  if (!notes.length) {
    return (
      <Card radius="loose" padding="none" style={styles.shadow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("petProfilePage.notes.addNoteA11y")}
          style={styles.emptyCard}
          onPress={() => onOpenNote()}
        >
          <Text variant="body" style={styles.emptyText}>
            {t("petProfilePage.notes.empty")}
          </Text>
        </Pressable>
      </Card>
    );
  }

  if (notes.length > MAX_VISIBLE_NOTE_ROWS) {
    return (
      <Card radius="loose" padding="none" style={styles.shadow}>
        <ScrollView style={styles.notesScroll} nestedScrollEnabled showsVerticalScrollIndicator>
          {noteRows}
        </ScrollView>
      </Card>
    );
  }

  return (
    <Card radius="loose" padding="none" style={styles.shadow}>
      {noteRows}
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  shadow: {
    shadowColor: theme.palette.brand.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  notesScroll: {
    maxHeight: theme.spacing(14.5 * MAX_VISIBLE_NOTE_ROWS),
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: theme.palette.brand.surfaceBorder,
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(5),
  },
  emptyText: {
    color: theme.palette.brand.textSecondary,
  },
}));
