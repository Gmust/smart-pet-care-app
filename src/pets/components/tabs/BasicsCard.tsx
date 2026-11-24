import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { PetResponseDto } from "@/api/generated";
import { PencilIcon } from "@/icons/pencil";
import { CirclePlusIcon, PlusIcon } from "@/icons/plus";
import { Button } from "@/shadecn/ui/button";
import { Tabs } from "@/shadecn/ui/tabs";
import { Text } from "@/shadecn/ui/text";

import { BASICS_SEGMENTS, type BasicsSegment } from "../../constants";
import { AddBasicsItemDrawer } from "../pet-profile/actions/AddBasicsItemDrawer";
import { EditBasicsDrawer } from "../pet-profile/actions/EditBasicsDrawer";

type BasicsCardProps = {
  pet: PetResponseDto;
};

export function BasicsCard({ pet }: BasicsCardProps) {
  const { t } = useTranslation(["pets"]);
  const { theme } = useUnistyles();

  const [segment, setSegment] = useState<BasicsSegment>(
    BASICS_SEGMENTS.find((key) => (pet[key] ?? []).some(Boolean)) ?? BASICS_SEGMENTS[0]
  );
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const items = (pet[segment] ?? []).filter(Boolean);
  const sectionLabel = t(`petProfilePage.basics.segments.${segment}`);

  return (
    <Animated.View layout={LinearTransition.duration(220)} style={styles.card}>
      <Tabs
        variant="track"
        items={BASICS_SEGMENTS.map((key) => ({
          key,
          label: t(`petProfilePage.basics.segments.${key}`),
        }))}
        value={segment}
        onChange={setSegment}
      />

      {items.length ? (
        <>
          <Animated.View key={segment} entering={FadeIn.duration(220)} style={styles.list}>
            {items.map((item, index) => (
              <Text key={index} variant="body" style={styles.item}>
                {item}
              </Text>
            ))}
          </Animated.View>

          <View style={styles.footer}>
            <Button
              variant="text"
              size="hug"
              hitSlop={(theme.minTouchTarget - theme.iconSize.md) / 2}
              accessibilityLabel={t("petProfilePage.basics.edit", { section: sectionLabel })}
              icon={
                <PencilIcon
                  width={theme.iconSize.md}
                  height={theme.iconSize.md}
                  color={theme.palette.brand.primaryDefault}
                />
              }
              onPress={() => setIsEditOpen(true)}
            />
            <Button
              variant="text"
              size="hug"
              hitSlop={(theme.minTouchTarget - theme.iconSize.lg) / 2}
              accessibilityLabel={t("petProfilePage.basics.add", { section: sectionLabel })}
              icon={
                <PlusIcon
                  width={theme.iconSize.lg}
                  height={theme.iconSize.lg}
                  color={theme.palette.brand.primaryDefault}
                />
              }
              onPress={() => setIsAddOpen(true)}
            />
          </View>
        </>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          dotted
          icon={
            <CirclePlusIcon
              width={theme.iconSize.lg}
              height={theme.iconSize.lg}
              color={theme.palette.brand.textSecondary}
            />
          }
          onPress={() => setIsAddOpen(true)}
        >
          {t(`petProfilePage.basics.addEmpty.${segment}`)}
        </Button>
      )}

      <EditBasicsDrawer pet={pet} isOpen={isEditOpen} setIsOpen={setIsEditOpen} />
      <AddBasicsItemDrawer
        pet={pet}
        segment={segment}
        isOpen={isAddOpen}
        setIsOpen={setIsAddOpen}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.spacing(2),
    padding: theme.spacing(4),
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.white,
  },
  list: {
    paddingHorizontal: theme.spacing(2),
  },
  item: {
    ...theme.textStyles.body,
    color: theme.palette.brand.textSecondary,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: theme.spacing(4),
    paddingHorizontal: theme.spacing(3),
  },
}));
