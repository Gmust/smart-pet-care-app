import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AiIcon } from "@/icons/ai-icon";
import { ChevronRightIcon } from "@/icons/chevron-right";
import { Text } from "@/shadecn/ui/text";

export function EmptyConversation({
  petName,
  onSelectPrompt,
  onReviewSafety,
}: {
  petName: string;
  onSelectPrompt: (prompt: string) => void;
  onReviewSafety: () => void;
}) {
  const { t } = useTranslation(["assistant"]);
  const prompts = t("empty.prompts", { name: petName, returnObjects: true });
  const promptList = Array.isArray(prompts)
    ? prompts.filter((item) => typeof item === "string")
    : [];

  return (
    <View style={styles.emptyConversation}>
      <View style={styles.emptyIcon}>
        <AiIcon width={24} height={24} color={styles.emptyIconGlyph.color} />
      </View>
      <Text style={styles.emptyTitle}>{t("empty.title", { name: petName })}</Text>
      <Text style={styles.emptyBody}>{t("empty.body", { name: petName })}</Text>
      <View style={styles.promptList}>
        {promptList.map((prompt) => (
          <Pressable
            key={prompt}
            accessibilityRole="button"
            accessibilityLabel={prompt}
            onPress={() => onSelectPrompt(prompt)}
            style={({ pressed }) => [styles.promptChip, pressed && styles.pressed]}
          >
            <Text style={styles.promptText}>{prompt}</Text>
            <ChevronRightIcon width={16} height={16} color={styles.promptChevron.color} />
          </Pressable>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("consent.review")}
        onPress={onReviewSafety}
        style={styles.safetyLink}
      >
        <Text style={styles.safetyLinkText}>{t("empty.safety")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  pressed: { opacity: 0.72 },
  emptyConversation: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(3),
    paddingVertical: theme.spacing(6),
  },
  emptyIcon: {
    width: theme.spacing(14),
    height: theme.spacing(14),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.brand.primaryXsoft,
  },
  emptyIconGlyph: { color: theme.palette.brand.primaryDark },
  emptyTitle: {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize["2xl"],
    lineHeight: theme.fontSize["2xl"] * 1.3,
    textAlign: "center",
    color: theme.palette.brand.textPrimary,
  },
  emptyBody: {
    maxWidth: 310,
    textAlign: "center",
    fontSize: theme.fontSize.sm,
    lineHeight: theme.fontSize.sm * 1.5,
    color: theme.palette.brand.textBody,
  },
  promptList: { width: "100%", gap: theme.spacing(2), marginTop: theme.spacing(1) },
  promptChip: {
    minHeight: theme.spacing(12),
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius.xl,
    borderCurve: "continuous",
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: theme.spacing(2.5),
    backgroundColor: theme.palette.white,
  },
  promptText: { flex: 1, fontSize: theme.fontSize.sm, color: theme.palette.brand.textPrimary },
  promptChevron: { color: theme.palette.brand.primaryDefault },
  safetyLink: { minHeight: 44, justifyContent: "center", paddingHorizontal: theme.spacing(3) },
  safetyLinkText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.xs,
    color: theme.palette.brand.primaryDefault,
  },
}));
