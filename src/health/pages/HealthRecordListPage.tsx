import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import dayjs from "dayjs";
import { Redirect, useLocalSearchParams } from "expo-router";

import { AddButton } from "@/common/components/AddButton";
import { BackButton } from "@/common/components/BackButton";
import { CalendarSearchIcon } from "@/icons/calendar";
import { usePetQuery } from "@/pets/queries/usePetQuery";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { AddHealthRecordDrawer } from "../components/drawers/AddHealthRecordDrawer";
import { DateFilterDrawer } from "../components/drawers/DateFilterDrawer";
import { HealthRecordListSection } from "../components/HealthRecordListSection";
import { RecordSearchBar } from "../components/RecordSearchBar";
import { useHealthRecordsByTypeQuery } from "../queries/useHealthRecordsByTypeQuery";
import { useSymptomsQuery } from "../queries/useSymptomsQuery";
import { healthRecordListParamsSchema } from "../schemas/health-record-list-params.schema";
import { groupHealthRecordsByYear } from "../utils/groupHealthRecordsByYear";

export default function HealthRecordListPage() {
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

  const insets = useSafeAreaInsets();
  const { t } = useTranslation(["health"]);

  const parsedParams = healthRecordListParamsSchema.safeParse(useLocalSearchParams());
  const petId = parsedParams.success ? parsedParams.data.petId : undefined;
  const type = parsedParams.success ? parsedParams.data.type : undefined;

  const { data: pet } = usePetQuery(petId);
  const { data: records, isLoading } = useHealthRecordsByTypeQuery({
    petId,
    type,
    from: from ?? undefined,
    to: to ?? undefined,
  });
  const { data: symptomCatalog } = useSymptomsQuery();

  const symptomLabelByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of symptomCatalog ?? []) {
      if (item.name) map.set(item.name, item.label ?? item.name);
    }
    return map;
  }, [symptomCatalog]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return records ?? [];
    return (records ?? []).filter((record) =>
      [record.title, record.description, record.provider].some((field) =>
        field?.toLowerCase().includes(query)
      )
    );
  }, [records, search]);

  const groups = useMemo(() => groupHealthRecordsByYear(filteredRecords), [filteredRecords]);

  const currentYear = dayjs().year();
  const resolveLabel = (year: number) => {
    if (year === currentYear) return t("health:recordList.yearSections.thisYear");
    if (year === currentYear - 1) return t("health:recordList.yearSections.lastYear");
    return String(year);
  };

  // Deep links can carry arbitrary params — never render with an unvalidated
  // petId/type.
  if (!parsedParams.success) {
    return <Redirect href="/(tabs)/pets" />;
  }

  return (
    <>
      <View style={styles.screen}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <BackButton />
          <View style={styles.topBarTexts}>
            <Text style={styles.topBarTitle}>
              {t(`health:categoryLabels.${parsedParams.data.type}`)}
            </Text>
            {!!pet?.name && <Text style={styles.topBarSubtitle}>{pet.name}</Text>}
          </View>
          <AddButton
            accessibilityLabel={t("health:recordList.addRecord")}
            onPress={() => setIsCreateDrawerOpen(true)}
          />
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <RecordSearchBar value={search} onChangeText={setSearch} />
          </View>
          <Button
            variant="icon"
            size="icon"
            accessibilityLabel={t("health:recordList.filters.openFilter")}
            icon={<CalendarSearchIcon width={18} height={18} color={palette.brand.textSecondary} />}
            onPress={() => setIsDateFilterOpen(true)}
          />
        </View>

        <Animated.ScrollView
          entering={FadeIn.duration(200)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {isLoading ? (
            <Text style={styles.emptyText}>{t("health:recordList.loading")}</Text>
          ) : groups.length ? (
            <HealthRecordListSection
              groups={groups}
              resolveLabel={resolveLabel}
              symptomLabelByName={symptomLabelByName}
            />
          ) : (
            <Text style={styles.emptyText}>{t("health:recordList.empty")}</Text>
          )}
        </Animated.ScrollView>
      </View>

      <AddHealthRecordDrawer
        petId={parsedParams.data.petId}
        type={parsedParams.data.type}
        isOpen={isCreateDrawerOpen}
        setIsOpen={setIsCreateDrawerOpen}
      />

      <DateFilterDrawer
        isOpen={isDateFilterOpen}
        setIsOpen={setIsDateFilterOpen}
        from={from}
        to={to}
        onApply={(nextFrom, nextTo) => {
          setFrom(nextFrom);
          setTo(nextTo);
        }}
      />
    </>
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
    gap: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(4),
    paddingBottom: theme.spacing(2),
  },
  topBarTexts: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  topBarTitle: {
    ...theme.textStyles.titleL,
    letterSpacing: -0.12,
    textAlign: "center",
    color: theme.palette.brand.textBody,
  },
  topBarSubtitle: {
    ...theme.textStyles.bodyS,
    color: theme.palette.brand.textSecondary,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(4),
    paddingBottom: theme.spacing(3),
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
  },
  content: {
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    paddingBottom: theme.spacing(28),
  },
  emptyText: {
    ...theme.textStyles.body,
    color: theme.palette.brand.textSecondary,
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(4),
  },
}));
