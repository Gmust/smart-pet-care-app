import { useMemo, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { StyleSheet } from "react-native-unistyles";

import { CreatePetDrawer } from "@/pets/components/actions/CreatePetDrawer";
import { palette } from "@/styles/palette";

import type { PetHealth } from "../../types";
import { AddPetCard } from "../pet-card/AddPetCard";
import { HealthPetCard } from "../pet-card/HealthPetCard";
import { DotsIndicator } from "./DotsIndicator";
import { PetCarouselSlide } from "./PetCarouselSlide";

const CARD_HEIGHT = 196;

/** Distinct card color per pet; falls back to the brand forest green past 10 pets. */
const getPetCardColor = (index: number) => palette.petCard[index] ?? palette.brand.primaryDark;

type CarouselSlide = { type: "pet"; pet: PetHealth; color: string } | { type: "add" };

type PetCarouselProps = {
  pets: PetHealth[];
};

export function PetCarousel({ pets }: PetCarouselProps) {
  const { width } = useWindowDimensions();
  const progress = useSharedValue(0);

  const [openPetDrawer, setOpenPetDrawer] = useState(false);

  const slides: CarouselSlide[] = useMemo(
    () => [
      ...pets.map((pet, index) => ({
        type: "pet" as const,
        pet,
        color: getPetCardColor(index),
      })),
      { type: "add" as const },
    ],
    [pets]
  );

  return (
    <>
      <View style={styles.root}>
        <Carousel
          data={slides}
          width={width}
          height={CARD_HEIGHT}
          loop={false}
          pagingEnabled
          onProgressChange={progress}
          renderItem={({ item, animationValue }) => (
            <PetCarouselSlide animationValue={animationValue}>
              {item.type === "pet" ? (
                <HealthPetCard pet={item.pet} backgroundColor={item.color} />
              ) : (
                <AddPetCard onPress={() => setOpenPetDrawer(true)} />
              )}
            </PetCarouselSlide>
          )}
        />
        <DotsIndicator count={slides.length} progress={progress} />
      </View>
      <CreatePetDrawer isOpen={openPetDrawer} setIsOpen={setOpenPetDrawer} />
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.spacing(3),
    // Cancel HomePage's horizontal content padding so the carousel spans the
    // full screen width and cards can swipe completely off-screen.
    marginHorizontal: -theme.spacing(5),
  },
}));
