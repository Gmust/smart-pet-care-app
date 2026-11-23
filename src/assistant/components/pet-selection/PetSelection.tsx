import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { PetResponseDto } from "@/api/generated";
import { NAVIGATION_PRESS_HIGHLIGHT_DELAY_MS } from "@/common/constants";
import { AiIcon } from "@/icons/ai-icon";
import { ChevronIcon } from "@/icons/chevron";
import { PetSpeciesImage } from "@/pets/components/PetSpeciesImage";
import { useSpeciesLabel } from "@/pets/hooks/useSpeciesLabel";
import { Button } from "@/shadecn/ui/button";
import { cardVariants } from "@/shadecn/ui/card";
import { Text } from "@/shadecn/ui/text";

import { FocusHeading } from "../chat/chat-header/FocusHeading";

export function PetSelection({
  pets,
  loading,
  error,
  retry,
  choose,
  goToPets,
}: {
  pets: PetResponseDto[];
  loading: boolean;
  error: boolean;
  retry: () => void;
  choose: (id: string | null) => void;
  goToPets: () => void;
}) {
  const { t } = useTranslation(["assistant"]);
  const { theme } = useUnistyles();
  const speciesLabel = useSpeciesLabel();
  return (
    <SafeAreaView style={styles.selectionScreen}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.selectionContent}
      >
        <View style={styles.selectionIntro}>
          <View style={styles.aiMark}>
            <AiIcon
              width={theme.iconSize.xl}
              height={theme.iconSize.xl}
              color={styles.aiMarkIcon.color}
            />
          </View>
          <FocusHeading text={t("pets.title")} />
          <Text variant="body" style={styles.selectionBody}>
            {t("pets.subtitle")}
          </Text>
        </View>
        {loading && (
          <View style={styles.stateCard}>
            <ActivityIndicator color={styles.loadingIndicator.color} />
            <Text variant="body" style={styles.stateCopy}>
              {t("pets.loading")}
            </Text>
          </View>
        )}
        {error && (
          <View accessibilityRole="alert" style={styles.stateCard}>
            <Text variant="titleM" style={styles.stateTitle}>
              {t("pets.errorTitle")}
            </Text>
            <Text variant="body" style={styles.stateCopy}>
              {t("pets.error")}
            </Text>
            <Button onPress={retry}>{t("pets.retry")}</Button>
          </View>
        )}
        {!loading && !error && pets.length > 0 && (
          <View style={styles.petOptions}>
            {pets.map((pet) => (
              <Pressable
                key={pet.id}
                accessibilityRole="button"
                accessibilityLabel={t("pets.select", { name: pet.name })}
                onPress={() => choose(pet.id ?? "")}
                unstable_pressDelay={NAVIGATION_PRESS_HIGHLIGHT_DELAY_MS}
                style={({ pressed }) => [styles.petOption, pressed && cardVariants.pressed]}
              >
                <View style={styles.petOptionAvatar}>
                  <PetSpeciesImage photoUrl={pet.photoUrl} species={pet.species} variant="avatar" />
                </View>
                <View style={styles.petOptionCopy}>
                  <Text variant="titleM" style={styles.petOptionName}>
                    {pet.name}
                  </Text>
                  <Text variant="bodyS" style={styles.petOptionMeta} numberOfLines={1}>
                    {[pet.species && speciesLabel(pet.species), pet.breed]
                      .filter(Boolean)
                      .join(" · ") || t("pets.profile")}
                  </Text>
                </View>
                <View style={styles.petOptionAction}>
                  <ChevronIcon
                    direction="right"
                    width={20}
                    height={20}
                    color={styles.petOptionChevron.color}
                  />
                </View>
              </Pressable>
            ))}
          </View>
        )}
        {!loading && !error && pets.length === 0 && (
          <View style={styles.stateCard}>
            <Text variant="titleM" style={styles.stateTitle}>
              {t("pets.emptyTitle")}
            </Text>
            <Text variant="body" style={styles.stateCopy}>
              {t("pets.empty")}
            </Text>
            <Button onPress={goToPets}>{t("pets.add")}</Button>
          </View>
        )}
        <Text variant="caption" style={styles.selectionFootnote}>
          {t("pets.footnote")}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  selectionScreen: { flex: 1, backgroundColor: theme.palette.brand.surfacePage },
  selectionContent: {
    flexGrow: 1,
    gap: theme.spacing(5),
    paddingHorizontal: theme.spacing(5),
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  selectionIntro: { alignItems: "center", gap: theme.spacing(2.5) },
  aiMark: {
    width: theme.spacing(14),
    height: theme.spacing(14),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.brand.primaryXsoft,
  },
  aiMarkIcon: { color: theme.palette.brand.primaryDark },
  selectionBody: {
    maxWidth: 320,
    textAlign: "center",
    color: theme.palette.brand.textSecondary,
  },
  petOptions: { gap: theme.spacing(3) },
  petOption: {
    minHeight: theme.spacing(21),
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["2xl"],
    borderCurve: "continuous",
    padding: theme.spacing(3),
    backgroundColor: theme.palette.white,
  },
  petOptionAvatar: {
    width: theme.spacing(15),
    height: theme.spacing(15),
    overflow: "hidden",
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  petOptionCopy: { flex: 1, minWidth: 0, gap: theme.spacing(1) },
  petOptionName: {
    color: theme.palette.brand.textPrimary,
  },
  petOptionMeta: {
    color: theme.palette.brand.textSecondary,
  },
  petOptionAction: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.brand.primaryXsoft,
  },
  petOptionChevron: { color: theme.palette.brand.primaryDark },
  stateCard: {
    alignItems: "center",
    gap: theme.spacing(3),
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["2xl"],
    padding: theme.spacing(5),
    backgroundColor: theme.palette.white,
  },
  stateTitle: {
    color: theme.palette.brand.textPrimary,
  },
  stateCopy: {
    textAlign: "center",
    color: theme.palette.brand.textBody,
  },
  loadingIndicator: { color: theme.palette.brand.primaryDefault },
  selectionFootnote: {
    textAlign: "center",
    color: theme.palette.brand.textSecondary,
  },
}));
