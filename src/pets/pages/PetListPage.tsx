import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { CirclePlusIcon } from "@/icons/circle-plus";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { CreatePetDrawer } from "../components/CreatePetDrawer";
import { PetListCard } from "../components/PetListCard";
import { usePetsQuery } from "../queries/usePetsQuery";
import { PetListPageSkeleton, PetListSubtitleSkeleton } from "../skeletons/PetListPageSkeleton";
import { useRouter } from "expo-router";

export default function PetListPage() {
  const [openCreatePetDrawer, setOpenCreatePetDrawer] = useState(false);

  const { t } = useTranslation(["pets"]);
  const router = useRouter();
  const { data: pets, isLoading } = usePetsQuery();

  const handleOpenPet = (petId: string) => {
    router.push({ pathname: "/(tabs)/pet-profile", params: { petId } });
  };

  return (
    <>
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{t("pets:petListPage.title")}</Text>
            {isLoading ? (
              <PetListSubtitleSkeleton />
            ) : (
              <Text style={styles.subtitle}>
                {t("pets:petListPage.companions", { count: pets?.length ?? 0 })}
              </Text>
            )}
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.content}
        >
          <View style={styles.cardStack}>
            {isLoading ? (
              <PetListPageSkeleton />
            ) : (
              pets?.map((pet) => <PetListCard key={pet.id} pet={pet} onPress={handleOpenPet} />)
            )}
            {!isLoading && !pets?.length && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{t("pets:petListPage.emptyState")}</Text>
              </View>
            )}
          </View>

          <Button
            variant="ghost"
            size="md"
            dotted
            accessibilityLabel={t("pets:petListPage.addPet")}
            icon={<CirclePlusIcon width={20} height={20} color={palette.brand.textSecondary} />}
            style={styles.addButton}
            textStyle={styles.addButtonText}
            onPress={() => setOpenCreatePetDrawer(true)}
          >
            {t("pets:petListPage.addPet")}
          </Button>
        </ScrollView>
      </SafeAreaView>
      <CreatePetDrawer isOpen={openCreatePetDrawer} setIsOpen={setOpenCreatePetDrawer} />
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.palette.brand.surfacePage,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
  headerCopy: {
    flex: 1,
    gap: theme.spacing(1),
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize["2xl"],
    lineHeight: theme.fontSize["2xl"] * 1.3,
    color: theme.palette.brand.textBody,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.base,
    lineHeight: theme.fontSize.base * 1.4,
    color: theme.palette.brand.textSecondary,
  },
  content: {
    gap: theme.spacing(3),
    paddingHorizontal: theme.spacing(4),
    paddingBottom: theme.spacing(28),
  },
  cardStack: {
    gap: theme.spacing(2),
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.white,
    padding: theme.spacing(6),
  },
  emptyText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textSecondary,
  },
  addButton: {
    width: "100%",
  },
  addButtonText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.fontSize.sm * 1.4,
    color: theme.palette.brand.textSecondary,
  },
}));
