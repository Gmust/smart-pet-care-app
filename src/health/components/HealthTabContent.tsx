import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { PillIcon } from "@/icons/health/pill";
import { HeartPulseIcon } from "@/icons/heart";
import { BasicsCard } from "@/pets/components/tabs/BasicsCard";
import type { usePetQuery } from "@/pets/queries/usePetQuery";
import { palette } from "@/styles/palette";

import { useHealthRecordsQuery } from "../queries/useHealthRecordsQuery";
import { HealthHistorySection } from "./HealthHistorySection";
import { HealthOverviewRow } from "./HealthOverviewRow";
import { HealthSection } from "./HealthSection";

type Pet = NonNullable<ReturnType<typeof usePetQuery>["data"]>;

type Props = {
  pet: Pet;
};

export function HealthTabContent({ pet }: Props) {
  const { t } = useTranslation(["health", "pets"]);
  const { data: records, isLoading } = useHealthRecordsQuery(pet.id);

  const allergies = (pet.allergies ?? []).filter(Boolean);
  const chronicConditions = (pet.chronicConditions ?? []).filter(Boolean);

  return (
    <View style={styles.stack}>
      <HealthSection title={t("pets:petProfilePage.basics.title")}>
        <BasicsCard allergies={allergies} chronicConditions={chronicConditions} />
      </HealthSection>

      <HealthSection title={t("health:history.title")}>
        <HealthHistorySection petId={pet.id ?? ""} records={records} isLoading={isLoading} />
      </HealthSection>

      <HealthSection title={t("health:overview.sections.meds")}>
        <HealthOverviewRow
          title={t("health:overview.meds.title", { active: 0 })}
          subtitle={t("health:overview.meds.subtitle", { past: 0 })}
          tone="peach"
          icon={<PillIcon width={18} height={18} color={palette.brand.peachDefault} />}
          onPress={() => {}}
        />
      </HealthSection>

      <HealthSection title={t("health:overview.sections.symptoms")}>
        <HealthOverviewRow
          title={t("health:overview.symptoms.title", { all: 0 })}
          subtitle={t("health:overview.symptoms.subtitle", { lastMonth: 0 })}
          tone="peach"
          icon={<HeartPulseIcon width={18} height={18} color={palette.brand.peachDefault} />}
          onPress={() => {}}
        />
      </HealthSection>

      <HealthSection title={t("health:overview.sections.files")}>
        <HealthOverviewRow
          title={t("health:overview.files.title")}
          subtitle={t("health:overview.files.subtitle", { total: 0 })}
          tone="primary"
          icon={<HeartPulseIcon width={18} height={18} color={palette.brand.textBody} />}
          onPress={() => {}}
        />
      </HealthSection>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  stack: {
    gap: theme.spacing(6),
  },
}));
