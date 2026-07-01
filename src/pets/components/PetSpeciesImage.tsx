import type { ComponentType } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { IconProps } from "@/icons/icons";
import { CatIcon, DogIcon } from "@/icons/pets";
import { RabbitIcon } from "@/icons/pets/rabbit";
import { palette } from "@/styles/palette";

import { Image } from "expo-image";

type PetSpeciesImageVariant = "card" | "hero";

type PetSpeciesImageProps = {
  photoUrl?: string | null;
  species?: string | null;
  variant?: PetSpeciesImageVariant;
};

const SPECIES_ICONS: Record<string, ComponentType<IconProps>> = {
  cat: CatIcon,
  dog: DogIcon,
  rabbit: RabbitIcon,
};

export function PetSpeciesImage({ photoUrl, species, variant = "card" }: PetSpeciesImageProps) {
  if (photoUrl) {
    return <Image source={{ uri: photoUrl }} style={styles.image} contentFit="cover" />;
  }

  const SpeciesIcon = SPECIES_ICONS[species?.trim().toLowerCase() ?? ""];
  const isHero = variant === "hero";
  const iconSize = isHero ? 96 : 52;

  return (
    <View style={[styles.placeholder, isHero && styles.placeholderHero]}>
      {!!SpeciesIcon && (
        <SpeciesIcon width={iconSize} height={iconSize} color={palette.brand.textSecondary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  placeholderHero: {
    backgroundColor: theme.palette.brand.primaryXsoft,
  },
}));
