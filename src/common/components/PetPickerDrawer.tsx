import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useRouter } from "expo-router";

import type { PetResponseDto } from "@/api/generated";
import { SettingsIcon } from "@/icons/settings";
import { PetSpeciesImage } from "@/pets/components/PetSpeciesImage";
import { Button } from "@/shadecn/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerHeaderButton,
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
  onCreatePet?: () => void;
  showSettings?: boolean;
};

const MAX_HEIGHT_RATIO = 0.94;

export const PetPickerDrawer = ({
  isOpen,
  setIsOpen,
  pets,
  selectedPetId,
  onSelect,
  onCreatePet,
  showSettings = true,
}: Props) => {
  const { t } = useTranslation(["common"]);
  const { theme } = useUnistyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const [headerHeight, setHeaderHeight] = useState(0);
  const [listHeight, setListHeight] = useState(0);

  // DrawerContent adds 24 below its children; the sheet must be fixed-height to scroll.
  const contentHeight = headerHeight + listHeight + insets.bottom + theme.spacing(6);
  const snapPoint =
    headerHeight && listHeight ? Math.min(contentHeight, windowHeight * MAX_HEIGHT_RATIO) : "55%";

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent scrollable snapPoints={[snapPoint]} enableDynamicSizing={false}>
        {showSettings && (
          <DrawerHeaderButton
            accessibilityLabel={t("common:petSelector.settings")}
            icon={
              <SettingsIcon
                width={theme.iconSize.lg}
                height={theme.iconSize.lg}
                color={theme.palette.brand.textPrimary}
              />
            }
            onPress={() => {
              setIsOpen(false);
              router.navigate("/(tabs)/pet-list-settings");
            }}
          />
        )}
        <DrawerHeader onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}>
          <DrawerTitle>{t("common:petSelector.drawerTitle")}</DrawerTitle>
        </DrawerHeader>

        <DrawerScrollView>
          <View
            style={styles.content}
            onLayout={(event) => setListHeight(event.nativeEvent.layout.height)}
          >
            {pets.map((pet) =>
              pet.id ? (
                <Pressable
                  key={pet.id}
                  accessibilityRole="button"
                  accessibilityLabel={t("common:petSelector.select", { name: pet.name })}
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
                    <PetSpeciesImage
                      photoUrl={pet.photoUrl}
                      species={pet.species}
                      variant="avatar"
                    />
                  </View>
                  <Text variant="bodySemiBold" style={styles.name} numberOfLines={1}>
                    {pet.name}
                  </Text>
                </Pressable>
              ) : null
            )}
            {!!onCreatePet && (
              <Button
                variant="ghost"
                dotted
                onPress={() => {
                  setIsOpen(false);
                  onCreatePet();
                }}
              >
                {t("common:petSelector.createPet")}
              </Button>
            )}
          </View>
        </DrawerScrollView>
      </DrawerContent>
    </Drawer>
  );
};

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing(2),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(10),
    paddingHorizontal: theme.spacing(4),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(4),
    borderRadius: theme.borderRadius["2xl"],
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    backgroundColor: theme.palette.white,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(3),
  },
  rowSelected: {
    borderWidth: 1.5,
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
