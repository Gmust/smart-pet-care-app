import { Trans, useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { BackButton } from "@/common/components/BackButton";
import { Callout } from "@/common/components/Callout";
import { SectionHeader } from "@/common/components/SectionHeader";
import { SettingRow } from "@/common/components/SettingRow";
import { LayoutListIcon } from "@/icons/layout-list";
import { Text } from "@/shadecn/ui/text";

import { PetListModeTile } from "../components/list-settings/PetListModeTile";
import { PetListPreview } from "../components/list-settings/PetListPreview";
import { SinglePetPreview } from "../components/list-settings/SinglePetPreview";
import { usePetListMode } from "../hooks/usePetListMode";

export default function PetListSettingsPage() {
  const { t } = useTranslation(["pets"]);
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const { isListEnabled, setMode } = usePetListMode();

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + theme.spacing(2) }]}>
        <BackButton />
        <View style={styles.headerCopy}>
          <Text variant="titleL" style={styles.title}>
            {t("pets:petListSettings.title")}
          </Text>
          <Text variant="bodyS" style={styles.subtitle}>
            {t("pets:petListSettings.subtitle")}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <SettingRow
            icon={
              <LayoutListIcon
                width={theme.iconSize.md}
                height={theme.iconSize.md}
                color={theme.palette.brand.primaryDefault}
              />
            }
            title={t("pets:petListSettings.toggleTitle")}
            subtitle={t("pets:petListSettings.toggleSubtitle")}
            checked={isListEnabled}
            onCheckedChange={(checked) => setMode(checked ? "on" : "off")}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader label={t("pets:petListSettings.howItLooks")} />
          <View style={styles.modes}>
            <PetListModeTile
              label={t("pets:petListSettings.singleLabel")}
              selected={!isListEnabled}
              onPress={() => setMode("off")}
            >
              <SinglePetPreview />
            </PetListModeTile>
            <PetListModeTile
              label={t("pets:petListSettings.listLabel")}
              selected={isListEnabled}
              onPress={() => setMode("on")}
            >
              <PetListPreview />
            </PetListModeTile>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader label={t("pets:petListSettings.whatChanges")} />
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Text
                variant="bodySemiBold"
                style={[styles.infoTitle, !isListEnabled && styles.infoTitleActive]}
              >
                {t("pets:petListSettings.singleLabel")}
              </Text>
              <Text variant="bodyS" style={styles.infoText}>
                {t("pets:petListSettings.singleDescription")}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text
                variant="bodySemiBold"
                style={[styles.infoTitle, isListEnabled && styles.infoTitleActive]}
              >
                {t("pets:petListSettings.listLabel")}
              </Text>
              <Text variant="bodyS" style={styles.infoText}>
                {t("pets:petListSettings.listDescription")}
              </Text>
            </View>
          </View>
        </View>

        <Callout>
          <Trans
            t={t}
            i18nKey="pets:petListSettings.callout"
            components={{ highlight: <Text variant="bodyS" style={styles.highlight} /> }}
          />
        </Callout>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.palette.brand.surfacePage,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    paddingBottom: theme.spacing(1),
  },
  headerCopy: {
    flex: 1,
    alignItems: "center",
    gap: theme.spacing(1),
  },
  headerSpacer: {
    width: theme.spacing(9),
  },
  title: {
    color: theme.palette.brand.textBody,
    textAlign: "center",
  },
  subtitle: {
    color: theme.palette.brand.textSecondary,
    textAlign: "center",
  },
  content: {
    gap: theme.spacing(5),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(28),
  },
  card: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.white,
    boxShadow: theme.shadows.card,
  },
  section: {
    gap: theme.spacing(2),
  },
  modes: {
    flexDirection: "row",
    gap: theme.spacing(3),
  },
  infoCard: {
    gap: theme.spacing(2.5),
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.white,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(3.5),
  },
  infoItem: {
    gap: theme.spacing(0.5),
  },
  infoTitle: {
    color: theme.palette.brand.textPrimary,
  },
  infoTitleActive: {
    color: theme.palette.brand.primaryDark,
  },
  infoText: {
    color: theme.palette.brand.textSecondary,
  },
  highlight: {
    color: theme.palette.brand.peachDefault,
  },
}));
