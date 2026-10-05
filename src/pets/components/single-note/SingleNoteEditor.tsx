import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, Pressable, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useRouter } from "expo-router";

import { BackButton } from "@/common/components/BackButton";
import { DeleteConfirmDialog } from "@/common/components/DeleteConfirmDialog";
import { getApiErrorMessage } from "@/errors/utils/getApiErrorMessage";
import { ChevronIcon } from "@/icons/chevron";
import { TrashIcon } from "@/icons/trash";
import { useUndoRedoText } from "@/pets/hooks/useUndoRedoText";
import { encodeNoteField } from "@/pets/queries/notes/noteFieldSentinel";
import { useCreateNoteMutation } from "@/pets/queries/notes/useCreateNoteMutation";
import { useDeleteNoteMutation } from "@/pets/queries/notes/useDeleteNoteMutation";
import { useUpdateNoteMutation } from "@/pets/queries/notes/useUpdateNoteMutation";
import { Button } from "@/shadecn/ui/button";
import { Input } from "@/shadecn/ui/input";
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

  // Not a TanStack Form: this screen autosaves on exit, there's nothing to
  // submit or validate — don't copy this exception for an actual form.
  const [title, setTitle] = useState(initialTitle);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // Frozen at mount: initialTitle/initialContent drift after a save (cache
  // write, refetch) while this screen stays open, and comparing against the
  // live prop would PATCH the stale pre-edit text back over that save.
  const [seed] = useState({ title: initialTitle, content: initialContent });

  const isDeletedRef = useRef(false);

  const {
    value: content,
    setValue: setContent,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedoText(initialContent);

  const { mutateAsync: createNote } = useCreateNoteMutation();
  const { mutateAsync: updateNote } = useUpdateNoteMutation();
  const { mutateAsync: deleteNote, isPending: isDeleting } = useDeleteNoteMutation();

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

    const onError = (error: unknown) => {
      console.error(error);
      Toast.show({ type: "error", text1: getApiErrorMessage(error) });
    };

    if (noteId && isEmpty) {
      // mutateAsync settles regardless of subscribers; mutate(vars, { onError })
      // would not — MutationObserver#notify gates it on hasListeners(), already
      // false by the time this unmount-triggered request resolves.
      deleteNote({ petId, noteId })
        .then(() =>
          Toast.show({ type: "success", text1: t("pets:singleNotePage.deleteDialog.success") })
        )
        .catch(onError);
      return;
    }
    if (isEmpty) return;

    const isDirty = trimmedTitle !== seed.title.trim() || trimmedContent !== seed.content.trim();
    if (!isDirty) return;

    // See noteFieldSentinel.ts for why a blank field is encoded before sending.
    if (noteId) {
      // An omitted key is left unchanged: sending both would overwrite a
      // title or content edited elsewhere since this screen opened.
      const dto = {
        ...(trimmedTitle !== seed.title.trim() ? { title: encodeNoteField(trimmedTitle) } : {}),
        ...(trimmedContent !== seed.content.trim()
          ? { content: encodeNoteField(trimmedContent) }
          : {}),
      };
      updateNote({ petId, noteId, dto }).catch(onError);
    } else {
      const dto = {
        title: encodeNoteField(trimmedTitle),
        content: encodeNoteField(trimmedContent),
      };
      createNote({ petId, dto }).catch(onError);
    }
  }, [noteId, petId, seed, updateNote, createNote, deleteNote, t]);

  const saveIfDirtyRef = useRef(saveIfDirty);
  useEffect(() => {
    saveIfDirtyRef.current = saveIfDirty;
  }, [saveIfDirty]);

  useEffect(() => {
    return () => saveIfDirtyRef.current();
  }, []);

  const handleDelete = async () => {
    if (!noteId) return;
    await deleteNote({ petId, noteId });
    isDeletedRef.current = true;
    Toast.show({ type: "success", text1: t("pets:singleNotePage.deleteDialog.success") });
    router.back();
  };

  return (
    <Pressable style={[styles.screen, { paddingBottom: insets.bottom }]} onPress={Keyboard.dismiss}>
      <View style={[styles.topBar, styles.topBarInset(insets.top)]}>
        <BackButton />

        <Input
          variant="plain"
          wrapperStyle={styles.titleInputWrapper}
          inputStyle={[styles.titleInput, theme.textStyles.titleL]}
          value={title}
          onChangeText={setTitle}
          placeholder={t("pets:singleNotePage.untitled")}
          placeholderTextColor={theme.palette.brand.textSecondary}
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
        <Input
          multiline
          variant="static"
          wrapperStyle={styles.bodyInputWrapper}
          containerStyle={styles.bodyInputContainer}
          inputStyle={styles.bodyInput}
          value={content}
          onChangeText={setContent}
          placeholder={t("pets:singleNotePage.contentPlaceholder")}
        />

        <View style={styles.controlBar}>
          <Button
            variant="text"
            size="hug"
            accessibilityLabel={t("pets:singleNotePage.undoA11y")}
            disabled={!canUndo}
            onPress={undo}
            hitSlop={(theme.minTouchTarget - theme.iconSize.lg) / 2}
          >
            <ChevronIcon
              direction="left"
              width={theme.iconSize.lg}
              height={theme.iconSize.lg}
              color={canUndo ? theme.palette.brand.textBody : theme.palette.brand.textFaint}
            />
          </Button>
          <Button
            variant="text"
            size="hug"
            accessibilityLabel={t("pets:singleNotePage.redoA11y")}
            disabled={!canRedo}
            onPress={redo}
            hitSlop={(theme.minTouchTarget - theme.iconSize.lg) / 2}
          >
            <ChevronIcon
              direction="right"
              width={theme.iconSize.lg}
              height={theme.iconSize.lg}
              color={canRedo ? theme.palette.brand.textBody : theme.palette.brand.textFaint}
            />
          </Button>
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
  topBarInset: (topInset: number) => ({ paddingTop: topInset + theme.spacing(2) }),
  topBarSpacer: {
    width: theme.spacing(9),
  },
  titleInputWrapper: {
    flex: 1,
    minWidth: 0,
  },
  titleInput: {
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
  bodyInputWrapper: {
    flex: 1,
  },
  bodyInputContainer: {
    flex: 1,
    alignItems: "stretch",
  },
  bodyInput: {
    flex: 1,
    paddingVertical: theme.spacing(3.5),
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
