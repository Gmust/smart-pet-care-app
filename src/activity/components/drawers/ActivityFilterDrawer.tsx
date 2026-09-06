import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import dayjs from "dayjs";

import type { ActivityIntensity, ActivityType } from "@/api/generated";
import { DateTimeField } from "@/common/components/DateTimeField";
import { Button } from "@/shadecn/ui/button";
import { Chip } from "@/shadecn/ui/chip";
import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerScrollView,
  DrawerTitle,
} from "@/shadecn/ui/drawer";
import { Text } from "@/shadecn/ui/text";

import { ACTIVITY_INTENSITIES, ACTIVITY_TYPE_ICON, ACTIVITY_TYPES } from "../../constants";
import type { ActivityFilters } from "../../types";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  from: string | null;
  to: string | null;
  filters: ActivityFilters;
  onApply: (from: string | null, to: string | null, filters: ActivityFilters) => void;
};

const toggle = <T,>(values: T[], value: T): T[] =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

export const ActivityFilterDrawer = ({ isOpen, setIsOpen, from, to, filters, onApply }: Props) => {
  const { t } = useTranslation(["activity"]);

  const [pendingFrom, setPendingFrom] = useState(from);
  const [pendingTo, setPendingTo] = useState(to);
  const [pendingTypes, setPendingTypes] = useState<ActivityType[]>(filters.types);
  const [pendingIntensities, setPendingIntensities] = useState<ActivityIntensity[]>(
    filters.intensities
  );

  // Re-seed from the applied filters each time the drawer opens, so an
  // abandoned edit doesn't leak into the next open.
  useEffect(() => {
    if (!isOpen) return;
    setPendingFrom(from);
    setPendingTo(to);
    setPendingTypes(filters.types);
    setPendingIntensities(filters.intensities);
  }, [isOpen, from, to, filters]);

  const clearAll = () => {
    setPendingFrom(null);
    setPendingTo(null);
    setPendingTypes([]);
    setPendingIntensities([]);
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent scrollable snapPoints={["80%"]} enableDynamicSizing={false}>
        <DrawerCloseButton />

        <DrawerHeader>
          <DrawerTitle>{t("activity:filters.title")}</DrawerTitle>
        </DrawerHeader>

        <DrawerScrollView contentContainerStyle={styles.content}>
          <View style={styles.field}>
            <Text style={styles.label}>{t("activity:filters.dateRange")}</Text>
            <View style={styles.row}>
              <View style={styles.rowItem}>
                <DateTimeField
                  mode="date"
                  label={t("activity:filters.from")}
                  placeholder={t("activity:filters.fromPlaceholder")}
                  value={pendingFrom ? new Date(pendingFrom) : null}
                  display={(date) => dayjs(date).format("MMM D, YYYY")}
                  maximumDate={pendingTo ? new Date(pendingTo) : new Date()}
                  // The picker keeps the current time-of-day; snap to day
                  // boundaries so a range never hides part of its own end days.
                  onChange={(date) => setPendingFrom(dayjs(date).startOf("day").toISOString())}
                />
              </View>
              <View style={styles.rowItem}>
                <DateTimeField
                  mode="date"
                  label={t("activity:filters.to")}
                  placeholder={t("activity:filters.toPlaceholder")}
                  value={pendingTo ? new Date(pendingTo) : null}
                  display={(date) => dayjs(date).format("MMM D, YYYY")}
                  minimumDate={pendingFrom ? new Date(pendingFrom) : undefined}
                  maximumDate={new Date()}
                  onChange={(date) => setPendingTo(dayjs(date).endOf("day").toISOString())}
                />
              </View>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t("activity:filters.type")}</Text>
            <View style={styles.chips}>
              {ACTIVITY_TYPES.map((type) => {
                const isSelected = pendingTypes.includes(type);
                return (
                  <Chip
                    key={type}
                    label={t(`activity:types.${type}`)}
                    icon={ACTIVITY_TYPE_ICON[type]}
                    tone={isSelected ? "primary" : "neutral"}
                    variant={isSelected ? "default" : "ghost"}
                    onPress={() => setPendingTypes((current) => toggle(current, type))}
                  />
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t("activity:filters.intensity")}</Text>
            <View style={styles.chips}>
              {ACTIVITY_INTENSITIES.map((intensity) => {
                const isSelected = pendingIntensities.includes(intensity);
                return (
                  <Chip
                    key={intensity}
                    label={t(`activity:intensities.${intensity}`)}
                    tone={isSelected ? "primary" : "neutral"}
                    variant={isSelected ? "default" : "ghost"}
                    onPress={() => setPendingIntensities((current) => toggle(current, intensity))}
                  />
                );
              })}
            </View>
            {pendingIntensities.length > 0 && (
              <Text variant="caption" style={styles.note}>
                {t("activity:filters.nullIntensityNote")}
              </Text>
            )}
          </View>
        </DrawerScrollView>

        <DrawerFooter style={styles.footer}>
          <Button
            size="lg"
            variant="primary"
            onPress={() => {
              onApply(pendingFrom, pendingTo, {
                types: pendingTypes,
                intensities: pendingIntensities,
              });
              setIsOpen(false);
            }}
          >
            {t("activity:filters.apply")}
          </Button>
          <Button size="md" variant="secondary" onPress={clearAll}>
            {t("activity:filters.clearAll")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing(5),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(20),
    paddingHorizontal: theme.spacing(4),
  },
  field: {
    gap: theme.spacing(1.5),
  },
  label: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textSecondary,
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing(3),
  },
  rowItem: {
    flex: 1,
    minWidth: 0,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing(1.5),
  },
  note: {
    color: theme.palette.brand.textSecondary,
  },
  footer: {
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    backgroundColor: "transparent",
  },
}));
