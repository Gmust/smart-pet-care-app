import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { PetResponseDto } from "@/api/generated";
import { ChevronIcon } from "@/icons/chevron";
import { PetSpeciesImage } from "@/pets/components/PetSpeciesImage";
import { Text } from "@/shadecn/ui/text";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const CHIP_TRANSITION = LinearTransition.duration(220);

type Props = {
  selectedPet: PetResponseDto;
  canSwitch: boolean;
  showAvatar?: boolean;
  onPress: () => void;
};

export const PetSwitcher = ({ selectedPet, canSwitch, showAvatar = true, onPress }: Props) => {
  const { t } = useTranslation(["common"]);
  const { theme } = useUnistyles();

  const content = (
    <>
      {showAvatar && (
        <Animated.View
          entering={FadeIn.duration(120).delay(160)}
          exiting={FadeOut.duration(80)}
          style={styles.avatar}
        >
          <PetSpeciesImage
            photoUrl={selectedPet.photoUrl}
            species={selectedPet.species}
            variant="avatar"
          />
        </Animated.View>
      )}
      <Text variant="titleM" style={styles.name} numberOfLines={1}>
        {selectedPet.name}
      </Text>
      {canSwitch && (
        <ChevronIcon
          direction="right"
          width={theme.iconSize.lg}
          height={theme.iconSize.lg}
          color={styles.chevron.color}
        />
      )}
    </>
  );

  if (!canSwitch) {
    return (
      <Animated.View layout={CHIP_TRANSITION} style={styles.chip}>
        {content}
      </Animated.View>
    );
  }

  return (
    <AnimatedPressable
      layout={CHIP_TRANSITION}
      accessibilityRole="button"
      accessibilityLabel={t("common:petSelector.label", { name: selectedPet.name })}
      accessibilityHint={t("common:petSelector.hint")}
      onPress={onPress}
      hitSlop={theme.spacing(1.5)}
      style={styles.chip}
    >
      {content}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
    borderWidth: theme.spacing(0.375),
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.brand.surfaceSunken,
    padding: theme.spacing(1),
    paddingRight: theme.spacing(3),
  },
  avatar: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius.full,
    overflow: "hidden",
  },
  name: {
    color: theme.palette.brand.textPrimary,
    flexShrink: 1,
    paddingLeft: theme.spacing(2),
  },
  chevron: {
    color: theme.palette.brand.textSecondary,
  },
}));
