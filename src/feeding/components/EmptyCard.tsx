import { StyleSheet } from "react-native-unistyles";

import { Card } from "@/shadecn/ui/card";
import { Text } from "@/shadecn/ui/text";

type EmptyCardProps = {
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export const EmptyCard = ({ message, actionLabel, onActionPress }: EmptyCardProps) => {
  const content = (
    <>
      <Text variant="bodyS" style={styles.message}>
        {message}
      </Text>
      {!!actionLabel && (
        <Text variant="bodySemiBold" style={styles.action}>
          {actionLabel}
        </Text>
      )}
    </>
  );

  if (!actionLabel || !onActionPress) {
    return (
      <Card radius="loose" padding="none" style={styles.card}>
        {content}
      </Card>
    );
  }

  return (
    <Card
      radius="loose"
      padding="none"
      style={styles.card}
      onPress={onActionPress}
      accessibilityLabel={actionLabel}
    >
      {content}
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(4),
    borderStyle: "dashed",
  },
  message: {
    textAlign: "center",
    color: theme.palette.brand.textSecondary,
  },
  action: {
    color: theme.palette.brand.primaryDefault,
  },
}));
