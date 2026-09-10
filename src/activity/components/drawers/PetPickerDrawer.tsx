import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { PetResponseDto } from "@/api/generated";
import { PetSpeciesImage } from "@/pets/components/PetSpeciesImage";
import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerScrollView,
  DrawerTitle,
} from "@/shadecn/ui/drawer";
import { Text } from "@/shadecn/ui/text";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  pets: PetResponseDto[];
  selectedPetId: string | undefined;
  onSelect: (petId: string) => void;
};

export const PetPickerDrawer = ({ isOpen, setIsOpen, pets, selectedPetId, onSelect }: Props) => {
  const { t } = useTranslation(["activity"]);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent scrollable snapPoints={["55%"]} enableDynamicSizing={false}>
        <DrawerCloseButton />
        <DrawerHeader>
          <DrawerTitle>{t("activity:petSelector.drawerTitle")}</DrawerTitle>
        </DrawerHeader>

        <DrawerScrollView contentContainerStyle={styles.content}>
          {pets.map((pet) =>
            pet.id ? (
              <Pressable
                key={pet.id}
                accessibilityRole="button"
                accessibilityLabel={t("activity:petSelector.select", { name: pet.name })}
                accessibilityState={{ selected: pet.id === selectedPetId }}
                onPress={() => {
                  onSelect(pet.id ?? "");
                  setIsOpen(false);
                }}
                style={({ pressed }) => [
                  styles.row,
                  pet.id === selectedPetId && styles.rowSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.avatar}>
                  <PetSpeciesImage photoUrl={pet.photoUrl} species={pet.species} />
                </View>
                <Text variant="bodySemiBold" style={styles.name} numberOfLines={1}>
                  {pet.name}
                </Text>
              </Pressable>
            ) : null
          )}
        </DrawerScrollView>
      </DrawerContent>
    </Drawer>
  );
};

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(10),
    paddingHorizontal: theme.spacing(4),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
    borderRadius: theme.borderRadius["2xl"],
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    backgroundColor: theme.palette.white,
    padding: theme.spacing(3),
  },
  rowSelected: {
    borderColor: theme.palette.brand.primaryDefault,
    backgroundColor: theme.palette.brand.primaryXsoft,
  },
  avatar: {
    width: theme.spacing(10),
    height: theme.spacing(10),
    borderRadius: theme.borderRadius.full,
    overflow: "hidden",
  },
  name: {
    flexShrink: 1,
    color: theme.palette.brand.textPrimary,
  },
  pressed: {
    opacity: 0.75,
  },
}));
