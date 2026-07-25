import { useTranslation } from "react-i18next";

import type { HealthRecordResponseDto } from "@/api/generated";
import { BugOffIcon } from "@/icons/health/bug-off";
import { WormIcon } from "@/icons/health/worm";
import { StethoscopeIcon } from "@/icons/stethoscope";
import { SyringeIcon } from "@/icons/syringe";
import { palette } from "@/styles/palette";

import { HEALTH_HISTORY_CATEGORIES } from "../constants";
import type { HealthHistoryCategory } from "../types";
import { HistoryCard } from "./HistoryCard";
import { HistoryGrid } from "./HistoryGrid";
import dayjs from "dayjs";
import { useRouter } from "expo-router";

const CATEGORY_ICON: Record<
  HealthHistoryCategory,
  React.ComponentType<{ width: number; height: number; color: string }>
> = {
  VetVisit: StethoscopeIcon,
  Vaccination: SyringeIcon,
  Deworming: WormIcon,
  AntiParasiteTreatment: BugOffIcon,
};

type Props = {
  petId: string;
  records: HealthRecordResponseDto[] | undefined;
  isLoading: boolean;
};

export function HealthHistorySection({ petId, records, isLoading }: Props) {
  const { t } = useTranslation(["health"]);
  const router = useRouter();

  return (
    <HistoryGrid>
      {HEALTH_HISTORY_CATEGORIES.map((category) => {
        const latest = records
          ?.filter((record) => record.type === category)
          .sort((a, b) => dayjs(b.performedAt).valueOf() - dayjs(a.performedAt).valueOf())[0];

        const Icon = CATEGORY_ICON[category];
        const title = t(`health:categoryLabels.${category}`);

        const isOverdue = latest?.nextDueAt ? dayjs(latest.nextDueAt).isBefore(dayjs()) : false;
        const subtitle = !latest
          ? t("health:history.noRecords")
          : isOverdue
            ? t("health:history.overdue", { date: dayjs(latest.nextDueAt).format("YYYY-MM-DD") })
            : latest.nextDueAt
              ? t("health:history.next", { date: dayjs(latest.nextDueAt).format("YYYY-MM-DD") })
              : t("health:history.last", { date: dayjs(latest.performedAt).format("YYYY-MM-DD") });

        return (
          <HistoryCard
            key={category}
            title={title}
            subtitle={isLoading ? t("health:history.loading") : subtitle}
            variant={isOverdue ? "overdue" : "default"}
            icon={<Icon width={20} height={20} color={palette.brand.peachDefault} />}
            onPress={() =>
              router.navigate({
                pathname: "/(tabs)/health-record-list",
                params: { petId, type: category },
              })
            }
          />
        );
      })}
    </HistoryGrid>
  );
}
