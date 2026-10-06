import { ActivityIndicator, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useIsMutating } from "@tanstack/react-query";
import { Redirect, useLocalSearchParams } from "expo-router";

import { QueryErrorState } from "@/common/components/QueryErrorState";
import { getApiError } from "@/errors/utils/getApiError";
import { SingleNoteEditor } from "@/pets/components/single-note/SingleNoteEditor";
import { notesMutationKeys } from "@/pets/queries/notes/notesQueryKeys";
import { useNotesQuery } from "@/pets/queries/notes/useNotesQuery";
import { usePetQuery } from "@/pets/queries/usePetQuery";
import { noteParamsSchema } from "@/pets/schemas/note-params.schema";

export default function SingleNotePage() {
  const parsedParams = noteParamsSchema.safeParse(useLocalSearchParams());
  const petId = parsedParams.success ? parsedParams.data.petId : undefined;
  const noteId = parsedParams.success ? parsedParams.data.noteId : undefined;

  const { data: pet } = usePetQuery(petId);
  const {
    data: notes,
    isLoading: isNotesLoading,
    isError: isNotesError,
    isPaused: isNotesPaused,
    error: notesError,
    refetch: refetchNotes,
  } = useNotesQuery(petId);

  // A save still in flight means the cache holds the pre-edit text. Seeding the
  // editor from it would lose the save: the editor freezes its baseline at mount
  // and the next exit would PATCH the stale text back. Paused ones are excluded,
  // or the screen would spin for the whole offline episode.
  const isSavePending = useIsMutating({
    mutationKey: notesMutationKeys.updateNote,
    predicate: ({ state }) =>
      !state.isPaused &&
      typeof state.variables === "object" &&
      state.variables !== null &&
      "noteId" in state.variables &&
      state.variables.noteId === noteId,
  });

  // Deep links can carry arbitrary params — never render with an unvalidated
  // petId, matching the guard in PetProfilePage / HealthRecordListPage.
  if (!parsedParams.success || !petId) {
    return <Redirect href="/(tabs)/pets" />;
  }

  // A 404 is the contract's pet_not_found: the pet is gone, so no retry can
  // ever succeed. Send the user to the list rather than offer one.
  if (getApiError(notesError).status === 404) {
    return <Redirect href="/(tabs)/pets" />;
  }

  // Only the absence of data may replace the editor. A failed refetch keeps the
  // cached note and still sets status "error", and swapping the screen then tears
  // the editor down mid-edit, firing its save into the same bad network.
  const isNotesUnavailable = !notes && (isNotesError || isNotesPaused);
  if (noteId && isNotesUnavailable) {
    return <QueryErrorState onRetry={() => refetchNotes()} fallbackHref="/(tabs)/pets" />;
  }

  const existingNote = noteId ? notes?.find((note) => note.id === noteId) : undefined;

  // A noteId that no longer resolves (deleted elsewhere, bad link) sends the
  // user back to the pet instead of leaving them on a permanent spinner.
  if (noteId && !isNotesLoading && !existingNote) {
    return <Redirect href={{ pathname: "/(tabs)/pets/pet-profile", params: { petId } }} />;
  }

  if (noteId && (!existingNote || isSavePending)) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SingleNoteEditor
      key={noteId ?? "new"}
      petId={petId}
      petName={pet?.name ?? ""}
      noteId={noteId}
      initialTitle={existingNote?.title ?? ""}
      initialContent={existingNote?.content ?? ""}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.brand.surfacePage,
  },
}));
