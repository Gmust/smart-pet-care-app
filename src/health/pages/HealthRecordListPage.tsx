import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { LayoutChangeEvent } from "react-native";
import { View } from "react-native";
import Animated, {
  Extrapolation,
  FadeIn,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useFocusEffect, useLocalSearchParams } from "expo-router";

import type { HealthRecordResponseDto } from "@/api/generated";
import { AddButton } from "@/common/components/AddButton";
import { BackButton } from "@/common/components/BackButton";
import { DeleteConfirmDialog } from "@/common/components/DeleteConfirmDialog";
import { usePetQuery } from "@/pets/queries/usePetQuery";
import { Text } from "@/shadecn/ui/text";

import { AddHealthRecordDrawer } from "../components/drawers/AddHealthRecordDrawer";
import { DateFilterDrawer } from "../components/drawers/DateFilterDrawer";
import { HealthRecordListSection } from "../components/HealthRecordListSection";
import { RecordSearchRow, type RecordSearchRowHandle } from "../components/RecordSearchRow";
import { useHealthRecordDelete } from "../hooks/useHealthRecordDelete";
import { useHealthRecordsByTypeQuery } from "../queries/useHealthRecordsByTypeQuery";
import { useSymptomsQuery } from "../queries/useSymptomsQuery";
import { healthRecordListParamsSchema } from "../schemas/health-record-list-params.schema";
import { HealthRecordListSkeleton } from "../skeletons/HealthRecordListSkeleton";
import { groupHealthRecordsByYear } from "../utils/groupHealthRecordsByYear";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// A static overlay of fixed height/opacity has no good size: small enough to
// not cover the list's resting-state top content and it's too thin to read
// as a smooth fade (a handful of px can't show gradation at all); large
// enough to fade smoothly and it permanently sits over real text. Tying
// opacity to scroll position instead sidesteps that entirely — invisible at
// rest (scrollY 0, nothing has scrolled up under the bar yet), fading in
// only as content actually approaches the search row, so the fade zone can
// be generously tall without ever touching text at rest.
// Colors derived from palette.brand.surfacePage (#f5f1ea = rgb(245,241,234));
// update by hand if that token's color ever changes.
const SCRIM_COLORS = [
  "rgba(245,241,234,1)",
  "rgba(245,241,234,0.6)",
  "rgba(245,241,234,0.25)",
  "rgba(245,241,234,0)",
] as const;
const SCRIM_LOCATIONS = [0, 0.35, 0.7, 1] as const;
const SCRIM_SPACING_UNITS = 10;

export default function HealthRecordListPage() {
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecordResponseDto | null>(null);
  const [searchRowHeight, setSearchRowHeight] = useState(0);
  // Bumped whenever the screen blurs, to force-remount HealthRecordCard (and
  // reset its local isExpanded) on the next visit — see the useFocusEffect
  // below for why the screen doesn't unmount on its own.
  const [cardsResetKey, setCardsResetKey] = useState(0);
  const searchRowRef = useRef<RecordSearchRowHandle>(null);

  const insets = useSafeAreaInsets();
  const { t } = useTranslation(["health"]);
  const { theme } = useUnistyles();

  const scrimHeight = theme.spacing(SCRIM_SPACING_UNITS);
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const scrimAnimatedStyle = useAnimatedStyle(
    () => ({
      opacity: interpolate(scrollY.value, [0, scrimHeight], [0, 1], Extrapolation.CLAMP),
    }),
    [scrimHeight]
  );

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
  const { requestDelete, dialogProps } = useHealthRecordDelete(petId);

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

  // Search/date filters and expanded cards are local UI state, not part of
  // the query params, so leaving the screen (or switching category via the
  // same route) wouldn't otherwise clear them — reset on blur so the next
  // visit starts fresh.
  useFocusEffect(
    useCallback(() => {
      return () => {
        setSearch("");
        setFrom(null);
        setTo(null);
        setCardsResetKey((prev) => prev + 1);
      };
    }, [])
  );

  // A bottom-sheet drawer closing while its own field is still focused can
  // hand focus off to the search bar underneath (Android's focus-search
  // landing on the nearest focusable view once the sheet's input unmounts) —
  // observed both via the drawer's close button and its backdrop tap, with
  // the stray focus arriving at some point during/after the dismiss
  // animation. Rather than racing a timer against it (which let the bar
  // visibly flash active before correcting itself), arm a guard that
  // intercepts the stray onFocus itself and blurs before it ever renders.
  useEffect(() => {
    if (isCreateDrawerOpen || isDateFilterOpen) return;
    searchRowRef.current?.guardAgainstStrayFocus();
  }, [isCreateDrawerOpen, isDateFilterOpen]);

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
            <Text variant="titleL" style={styles.topBarTitle}>
              {t(`health:categoryLabels.${parsedParams.data.type}`)}
            </Text>
            {!!pet?.name && (
              <Text variant="bodyS" style={styles.topBarSubtitle}>
                {pet.name}
              </Text>
            )}
          </View>
          <AddButton
            accessibilityLabel={t("health:recordList.addRecord")}
            onPress={() => {
              searchRowRef.current?.blur();
              setIsCreateDrawerOpen(true);
            }}
          />
        </View>

        <View style={styles.listArea}>
          <Animated.ScrollView
            entering={FadeIn.duration(200)}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.content, { paddingTop: searchRowHeight }]}
          >
            {isLoading ? (
              <HealthRecordListSkeleton />
            ) : groups.length ? (
              <HealthRecordListSection
                key={cardsResetKey}
                groups={groups}
                resolveLabel={resolveLabel}
                symptomLabelByName={symptomLabelByName}
                onEdit={setEditingRecord}
                onRequestDelete={(record) =>
                  requestDelete({ id: record.id ?? "", title: record.title ?? "" })
                }
              />
            ) : (
              <Text variant="body" style={styles.emptyText}>
                {t("health:recordList.empty")}
              </Text>
            )}
          </Animated.ScrollView>

          <AnimatedLinearGradient
            pointerEvents="none"
            colors={SCRIM_COLORS}
            locations={SCRIM_LOCATIONS}
            style={[
              styles.scrim,
              { top: searchRowHeight, height: scrimHeight },
              scrimAnimatedStyle,
            ]}
          />

          <View
            style={styles.searchRow}
            onLayout={(event: LayoutChangeEvent) =>
              setSearchRowHeight(event.nativeEvent.layout.height)
            }
          >
            <RecordSearchRow
              ref={searchRowRef}
              value={search}
              onChangeText={setSearch}
              onOpenDateFilter={() => {
                searchRowRef.current?.blur();
                setIsDateFilterOpen(true);
              }}
              isDateFilterActive={from !== null || to !== null}
            />
          </View>
        </View>
      </View>

      <AddHealthRecordDrawer
        petId={parsedParams.data.petId}
        type={parsedParams.data.type}
        isOpen={isCreateDrawerOpen}
        setIsOpen={setIsCreateDrawerOpen}
      />

      {editingRecord && (
        <AddHealthRecordDrawer
          key={editingRecord.id}
          record={editingRecord}
          isOpen
          setIsOpen={(open) => {
            if (!open) setEditingRecord(null);
          }}
        />
      )}

      <DeleteConfirmDialog {...dialogProps} />

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
    paddingBottom: theme.spacing(3),
  },
  topBarTexts: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: theme.spacing(1),
  },
  topBarTitle: {
    textAlign: "center",
    color: theme.palette.brand.textBody,
  },
  topBarSubtitle: {
    color: theme.palette.brand.textSecondary,
  },
  searchRow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: theme.palette.brand.surfacePage,
    paddingHorizontal: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  listArea: {
    flex: 1,
  },
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  content: {
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    paddingBottom: theme.spacing(28),
  },
  emptyText: {
    color: theme.palette.brand.textSecondary,
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(4),
  },
}));
