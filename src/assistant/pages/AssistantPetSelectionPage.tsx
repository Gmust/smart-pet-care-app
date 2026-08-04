import { useCallback, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { useFocusEffect, useRouter } from "expo-router";

import { ConsentDialog } from "@/assistant/components/dialogs/ConsentDialog";
import { PetSelection } from "@/assistant/components/pet-selection/PetSelection";
import {
  clearAiUsingConsent,
  getAiUsingConsent,
  setAiUsingConsent,
} from "@/assistant/utils/aiUsingConsentStorage";
import { BackButton } from "@/common/components/BackButton";
import { usePetsQuery } from "@/pets/queries/usePetsQuery";

export default function AssistantPetSelectionPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: pets, isLoading, isError, refetch } = usePetsQuery();

  const [consent, setConsent] = useState<boolean | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentDialogOpen, setConsentDialogOpen] = useState(false);

  const acceptConsent = async () => {
    await setAiUsingConsent(true);
    setConsent(true);
    setConsentDialogOpen(false);
  };

  const declineConsent = async () => {
    setConsent(null);
    setConsentDialogOpen(false);
    await clearAiUsingConsent();
    router.replace("/(tabs)/home");
  };

  const handleGetConsent = useCallback(async () => {
    try {
      const result = await getAiUsingConsent();
      const accepted = result.ok && result.value === true;
      setConsent(accepted);
      setConsentDialogOpen(!accepted);
    } catch {
      // A failed consent read fails closed: prompt for consent again rather than assuming it.
      setConsent(false);
      setConsentDialogOpen(true);
    } finally {
      setConsentChecked(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void handleGetConsent();
    }, [handleGetConsent])
  );

  return (
    <View style={styles.screen}>
      <PetSelection
        pets={pets ?? []}
        loading={isLoading || !consentChecked}
        error={isError}
        retry={() => void refetch()}
        choose={(petId) => {
          if (!consent) {
            setConsentDialogOpen(true);
            return;
          }
          router.replace(
            petId ? { pathname: "/(tabs)/assistant", params: { petId } } : "/(tabs)/assistant"
          );
        }}
        goToPets={() => router.push("/(tabs)/assistant-new-pet")}
      />
      <View style={[styles.backButton, { top: insets.top + 16 }]}>
        <BackButton />
      </View>
      <ConsentDialog
        isOpen={consentDialogOpen}
        onOpenChange={(open) => {
          if (!open && !consent) {
            declineConsent();
            return;
          }
          setConsentDialogOpen(open);
        }}
        onAccept={() => void acceptConsent()}
        onDecline={declineConsent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  backButton: {
    position: "absolute",
    left: 16,
    zIndex: 1,
  },
});
