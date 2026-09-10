import type { ListRenderItemInfo } from "react-native";
import { FlatList, RefreshControl, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { ActivityLogResponseDto } from "@/api/generated";

import type { ActivityListRow } from "../types";

import { ActivityCard } from "./ActivityCard";
import { ActivityDayHeader } from "./ActivityDayHeader";

type Props = {
  rows: ActivityListRow[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onSelectActivity: (activity: ActivityLogResponseDto) => void;
  ListEmptyComponent?: React.ComponentProps<typeof FlatList>["ListEmptyComponent"];
};

/**
 * Day headers and activity rows share one FlatList so off-screen rows are not
 * mounted (list-virtualization spec). The discriminated union keeps renderItem
 * type-safe without a cast.
 */
export const ActivityListSection = ({
  rows,
  isRefreshing,
  onRefresh,
  onSelectActivity,
  ListEmptyComponent,
}: Props) => {
  const { theme } = useUnistyles();

  const renderItem = ({ item }: ListRenderItemInfo<ActivityListRow>) => {
    if (item.kind === "header") {
      return <ActivityDayHeader dayIso={item.dayIso} />;
    }
    return <ActivityCard activity={item.activity} onPress={onSelectActivity} />;
  };

  return (
    <FlatList
      data={rows}
      keyExtractor={(item) => item.key}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={theme.palette.brand.primaryDefault}
          colors={[theme.palette.brand.primaryDefault]}
        />
      }
    />
  );
};

const styles = StyleSheet.create((theme) => ({
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing(4),
    paddingBottom: theme.spacing(28),
  },
  separator: {
    height: theme.spacing(2),
  },
}));
