import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { ChevronRightIcon } from "@/icons/chevron-right";
import { SectionHeader } from "@/pets/components/SectionHeader";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

type Props = {
  title: string;
  /** Omit for sections with no header action (VetVisit, Treatments today). */
  actionLabel?: string;
  onActionPress?: () => void;
  children: ReactNode;
};

export function CareSection({ title, actionLabel, onActionPress, children }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerLabelRow}>
          <SectionHeader label={title} compact />
          {/* Inert for now — no section detail screen exists yet (agreed with product). */}
          <ChevronRightIcon width={12} height={12} color={palette.brand.textFaint} />
        </View>
        {!!actionLabel && (
          <Pressable
            accessibilityRole="button"
            onPress={onActionPress}
            accessibilityLabel={actionLabel}
          >
            <Text style={styles.actionText}>{actionLabel}</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: {
    gap: theme.spacing(2),
    marginBottom: theme.spacing(5),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  headerLabelRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  actionText: {
    ...theme.textStyles.bodySemiBold,
    color: theme.palette.brand.primaryDefault,
  },
  content: {
    gap: theme.spacing(2),
  },
}));
