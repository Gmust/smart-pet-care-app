import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, Pressable, TextInput, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useRouter } from "expo-router";

import { DeleteConfirmDialog } from "@/common/components/DeleteConfirmDialog";
import { ChevronIcon } from "@/icons/chevron";
import { TrashIcon } from "@/icons/trash";
import { useUndoRedoText } from "@/pets/hooks/useUndoRedoText";
import { useCreateNoteMutation } from "@/pets/queries/notes/useCreateNoteMutation";
import { useDeleteNoteMutation } from "@/pets/queries/notes/useDeleteNoteMutation";
import { useUpdateNoteMutation } from "@/pets/queries/notes/useUpdateNoteMutation";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";

type Props = {
  petId: string;
  petName: string;
  noteId?: string;
  initialTitle: string;
  initialContent: string;
};

export const SingleNoteEditor = ({
  petId,
  petName,
  noteId,
  initialTitle,
  initialContent,
}: Props) => {
  const { t } = useTranslation(["pets", "common"]);
  const { theme } = useUnistyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState(initialTitle);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isDeletedRef = useRef(false);

  const {
    value: content,
    setValue: setContent,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedoText(initialContent);

  const { mutate: createNote } = useCreateNoteMutation();
  const { mutate: updateNote } = useUpdateNoteMutation();
  const {
    mutate: deleteNote,
    mutateAsync: deleteNoteAsync,
    isPending: isDeleting,
  } = useDeleteNoteMutation();

  const titleRef = useRef(title);
  const contentRef = useRef(content);
  useEffect(() => {
    titleRef.current = title;
    contentRef.current = content;
  }, [title, content]);

  const saveIfDirty = useCallback(() => {
    if (isDeletedRef.current) return;

    const trimmedTitle = titleRef.current.trim();
    const trimmedContent = contentRef.current.trim();
    const isEmpty = !trimmedTitle && !trimmedContent;

    if (noteId && isEmpty) {
      deleteNote({ petId, noteId });
      Toast.show({ type: "success", text1: t("pets:singleNotePage.deleteDialog.success") });
      return;
    }
    if (isEmpty) return;

    const isDirty =
      trimmedTitle !== initialTitle.trim() || trimmedContent !== initialContent.trim();
    if (!isDirty) return;

    if (noteId) {
      updateNote({ petId, noteId, title: trimmedTitle, content: trimmedContent });
    } else {
      createNote({ petId, title: trimmedTitle, content: trimmedContent });
    }
  }, [noteId, petId, initialTitle, initialContent, updateNote, createNote, deleteNote, t]);

  const saveIfDirtyRef = useRef(saveIfDirty);
  useEffect(() => {
    saveIfDirtyRef.current = saveIfDirty;
  }, [saveIfDirty]);

  useEffect(() => {
    return () => saveIfDirtyRef.current();
  }, []);

  const handleDelete = async () => {
    if (!noteId) return;
    await deleteNoteAsync({ petId, noteId });
    isDeletedRef.current = true;
    Toast.show({ type: "success", text1: t("pets:singleNotePage.deleteDialog.success") });
    router.back();
  };

  return (
    <Pressable style={[styles.screen, { paddingBottom: insets.bottom }]} onPress={Keyboard.dismiss}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Button
          size="icon"
          variant="icon"
          accessibilityLabel={t("common:actions.back")}
          onPress={() => router.back()}
        >
          <ChevronIcon
            direction="left"
            width={theme.iconSize.lg}
            height={theme.iconSize.lg}
            color={theme.palette.brand.primaryDark}
          />
        </Button>

        <TextInput
          style={[styles.titleInput, theme.textStyles.titleL]}
          value={title}
          onChangeText={setTitle}
          placeholder={t("pets:singleNotePage.untitled")}
          placeholderTextColor={theme.palette.brand.textSecondary}
          selectionColor={theme.palette.brand.primaryDefault}
        />

        {noteId ? (
          <Button
            size="icon"
            variant="icon"
            accessibilityLabel={t("pets:singleNotePage.deleteA11y")}
            onPress={() => setIsDeleteDialogOpen(true)}
          >
            <TrashIcon
              width={theme.iconSize.lg}
              height={theme.iconSize.lg}
              color={theme.palette.brand.danger}
            />
          </Button>
        ) : (
          <View style={styles.topBarSpacer} />
        )}
      </View>

      <Text variant="titleM" style={styles.petName}>
        {petName}
      </Text>

      <KeyboardAvoidingView style={styles.content} behavior="padding">
        <TextInput
          style={[styles.bodyInput, theme.textStyles.body]}
          value={content}
          onChangeText={setContent}
          placeholder={t("pets:singleNotePage.contentPlaceholder")}
          placeholderTextColor={theme.palette.brand.textFaint}
          selectionColor={theme.palette.brand.primaryDefault}
          multiline
          textAlignVertical="top"
        />

        <View style={styles.controlBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("pets:singleNotePage.undoA11y")}
            disabled={!canUndo}
            onPress={undo}
            hitSlop={8}
          >
            <ChevronIcon
              direction="left"
              width={theme.iconSize.lg}
              height={theme.iconSize.lg}
              color={canUndo ? theme.palette.brand.textBody : theme.palette.brand.textFaint}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("pets:singleNotePage.redoA11y")}
            disabled={!canRedo}
            onPress={redo}
            hitSlop={8}
          >
            <ChevronIcon
              direction="right"
              width={theme.iconSize.lg}
              height={theme.iconSize.lg}
              color={canRedo ? theme.palette.brand.textBody : theme.palette.brand.textFaint}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        title={t("pets:singleNotePage.deleteDialog.title")}
        description={t("pets:singleNotePage.deleteDialog.description")}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.palette.brand.surfacePage,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(4),
  },
  topBarSpacer: {
    width: theme.spacing(9),
  },
  titleInput: {
    flex: 1,
    minWidth: 0,
    textAlign: "center",
    color: theme.palette.brand.textBody,
  },
  petName: {
    textAlign: "center",
    color: theme.palette.brand.textSecondary,
  },
  content: {
    flex: 1,
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(2),
  },
  bodyInput: {
    flex: 1,
    borderWidth: theme.spacing(0.375),
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.palette.white,
    padding: theme.spacing(3.5),
    color: theme.palette.brand.textPrimary,
  },
  controlBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(6),
    padding: theme.spacing(2.5),
    marginBottom: theme.spacing(2),
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
}));
