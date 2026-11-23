import { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Callout } from "@/common/components/Callout";
import { Button } from "@/shadecn/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shadecn/ui/drawer";

import { PET_LIST_SUGGESTION_THRESHOLD } from "../constants";
import { usePetListMode } from "../hooks/usePetListMode";
import { usePetsQuery } from "../queries/usePetsQuery";

export const PetListSuggestionDrawer = () => {
  const { t } = useTranslation(["pets"]);
  const { mode, isLoaded, setMode, isSuggestionDismissed, dismissSuggestion } = usePetListMode();
  const { data: pets, isStale } = usePetsQuery();

  const petCount = pets?.length ?? 0;
  // Stale data is not trusted: right after a delete the cache still holds the old count until the
  // refetch lands, and the sheet would flash up for a pet that is already gone.
  const isOpen =
    isLoaded &&
    mode === undefined &&
    !isSuggestionDismissed &&
    !isStale &&
    petCount >= PET_LIST_SUGGESTION_THRESHOLD;

  // The sheet reports a dismiss for every close, including ours; only one from a sheet that was
  // open is the user's. A stale handler would read the previous value, hence the ref.
  const isOpenRef = useRef(isOpen);
  useLayoutEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && isOpenRef.current) dismissSuggestion();
      }}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("pets:petListSuggestion.title")}</DrawerTitle>
          <DrawerDescription>
            {t("pets:petListSuggestion.description", { petCount })}
          </DrawerDescription>
        </DrawerHeader>
        <View style={styles.hint}>
          <Callout tone="sunken">{t("pets:petListSuggestion.hint")}</Callout>
        </View>
        <DrawerFooter>
          <Button size="md" variant="primary" onPress={() => setMode("on")}>
            {t("pets:petListSuggestion.confirm")}
          </Button>
          <Button size="sm" variant="text" onPress={() => setMode("off")}>
            {t("pets:petListSuggestion.dismiss")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

const styles = StyleSheet.create((theme) => ({
  hint: {
    paddingHorizontal: theme.spacing(5),
  },
}));
