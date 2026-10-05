import { ActivityIndicator, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Redirect, useLocalSearchParams } from "expo-router";

import { QueryErrorState } from "@/common/components/QueryErrorState";
import { getApiError } from "@/errors/utils/getApiError";
import { SingleNoteEditor } from "@/pets/components/single-note/SingleNoteEditor";
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

  // Failed and offline-paused both leave notes undefined, which the catch-all
  // below would read as "not found" and silently redirect away. A warm cache
  // falls through on purpose and keeps showing the stale note.
  const isNotesUnavailable = isNotesError || (isNotesPaused && !notes);
  if (noteId && isNotesUnavailable) {
    return <QueryErrorState onRetry={() => refetchNotes()} fallbackHref="/(tabs)/pets" />;
  }

  const existingNote = noteId ? notes?.find((note) => note.id === noteId) : undefined;

  // A noteId that no longer resolves (deleted elsewhere, bad link) sends the
  // user back to the pet instead of leaving them on a permanent spinner.
  if (noteId && !isNotesLoading && !existingNote) {
    return <Redirect href={{ pathname: "/(tabs)/pets/pet-profile", params: { petId } }} />;
  }

  if (noteId && !existingNote) {
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
