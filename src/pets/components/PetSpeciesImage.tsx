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

const getNormalizedSpecies = (species: string | null | undefined): string | null => {
  switch (species?.trim().toLowerCase()) {
    case "cat":
      return "cat";
    case "dog":
      return "dog";
    case "rabbit":
      return "rabbit";
    default:
      return null;
  }
};

const renderSpeciesIcon = (species: string | null, props: IconProps) => {
  switch (species) {
    case "cat":
      return <CatIcon {...props} />;
    case "dog":
      return <DogIcon {...props} />;
    case "rabbit":
      return <RabbitIcon {...props} />;
    default:
      return null;
  }
};

export function PetSpeciesImage({ photoUrl, species, variant = "card" }: PetSpeciesImageProps) {
  if (photoUrl) {
    return <Image source={{ uri: photoUrl }} style={styles.image} contentFit="cover" />;
  }

  const normalizedSpecies = getNormalizedSpecies(species);
  const isHero = variant === "hero";
  const iconSize = isHero ? 96 : 52;

  return (
    <View style={[styles.placeholder, isHero && styles.placeholderHero]}>
      {renderSpeciesIcon(normalizedSpecies, {
        width: iconSize,
        height: iconSize,
        color: palette.brand.textSecondary,
      })}
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
