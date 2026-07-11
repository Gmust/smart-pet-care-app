import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { PetResponseDto } from "@/api";
import { ChevronRightIcon } from "@/icons/chevron-right";
import { PetSpeciesImage } from "@/pets/components/PetSpeciesImage";
import { Text } from "@/shadecn/ui/text";

import { useRouter } from "expo-router";

type Props = {
  selectedPet: PetResponseDto;
};

export const PetSelectorChip = ({ selectedPet }: Props) => {
  const { t } = useTranslation(["assistant"]);
  const router = useRouter();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={t("conversation.about", { name: selectedPet.name })}
      accessibilityHint={t("hints.changePet")}
      onPress={() => router.push("/(tabs)/assistant-pet-selection")}
      style={styles.petContext}
    >
      <View style={styles.contextAvatar}>
        <PetSpeciesImage photoUrl={selectedPet.photoUrl} species={selectedPet.species} />
      </View>
      <Text style={styles.contextName} numberOfLines={1}>
        {selectedPet.name}
      </Text>
      <ChevronRightIcon width={16} height={16} color={styles.contextChevron.color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create((theme) => ({
  petContext: {
    minHeight: theme.spacing(9),
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius.full,
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(2.5),
    paddingVertical: theme.spacing(1.5),
    backgroundColor: theme.palette.white,
  },
  contextAvatar: {
    width: theme.spacing(7),
    height: theme.spacing(7),
    overflow: "hidden",
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  contextName: {
    maxWidth: theme.spacing(28),
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.fontSize.sm * 1.3,
    color: theme.palette.brand.textPrimary,
  },
  contextChevron: { color: theme.palette.brand.primaryDefault },
}));
