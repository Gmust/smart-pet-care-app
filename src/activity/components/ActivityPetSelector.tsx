import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { PetResponseDto } from "@/api/generated";
import { ChevronIcon } from "@/icons/chevron";
import { PetSpeciesImage } from "@/pets/components/PetSpeciesImage";
import { Text } from "@/shadecn/ui/text";

type Props = {
  selectedPet: PetResponseDto;
  /** Hidden when the owner has a single pet — there is nothing to switch to. */
  canSwitch: boolean;
  onPress: () => void;
};

export const ActivityPetSelector = ({ selectedPet, canSwitch, onPress }: Props) => {
  const { t } = useTranslation(["activity"]);
  const { theme } = useUnistyles();

  const content = (
    <>
      <View style={styles.avatar}>
        <PetSpeciesImage photoUrl={selectedPet.photoUrl} species={selectedPet.species} />
      </View>
      <Text variant="bodySemiBold" style={styles.name} numberOfLines={1}>
        {selectedPet.name}
      </Text>
      {canSwitch && (
        <ChevronIcon
          direction="right"
          width={theme.iconSize.md}
          height={theme.iconSize.md}
          color={styles.chevron.color}
        />
      )}
    </>
  );

  if (!canSwitch) {
    return <View style={styles.chip}>{content}</View>;
  }

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={t("activity:petSelector.label", { name: selectedPet.name })}
      accessibilityHint={t("activity:petSelector.hint")}
      onPress={onPress}
      style={styles.chip}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create((theme) => ({
  chip: {
    minHeight: theme.spacing(9),
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius.full,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(3),
  },
  avatar: {
    width: theme.spacing(7),
    height: theme.spacing(7),
    borderRadius: theme.borderRadius.full,
    overflow: "hidden",
  },
  name: {
    color: theme.palette.brand.textPrimary,
    flexShrink: 1,
  },
  chevron: {
    color: theme.palette.brand.textSecondary,
  },
}));
