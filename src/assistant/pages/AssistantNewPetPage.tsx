import { useRef, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { useRouter } from "expo-router";

import type { PetResponseDto } from "@/api/generated";
import { CreatePetDrawer } from "@/pets/components/actions/CreatePetDrawer";

export default function AssistantNewPetPage() {
  const router = useRouter();
  const [openCreatePetDrawer, setOpenCreatePetDrawer] = useState(true);
  const createdRef = useRef(false);
  const hasLeftRef = useRef(false);

  // The sheet can report its own dismiss after a close the X already made, so this can run twice.
  const handleOpenChange = (open: boolean) => {
    setOpenCreatePetDrawer(open);
    if (open || createdRef.current || hasLeftRef.current) return;
    hasLeftRef.current = true;
    router.back();
  };

  const handleCreated = (pet: PetResponseDto) => {
    createdRef.current = true;
    if (pet.id) {
      router.replace({ pathname: "/(tabs)/assistant", params: { petId: pet.id } });
      return;
    }

    router.replace("/(tabs)/assistant");
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.anchor} />
      <CreatePetDrawer
        isOpen={openCreatePetDrawer}
        setIsOpen={handleOpenChange}
        onCreated={handleCreated}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.palette.brand.surfacePage,
  },
  anchor: {
    flex: 1,
  },
}));
