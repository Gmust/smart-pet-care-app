import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";

import { Button } from "@/shadecn/ui/button";
import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shadecn/ui/drawer";

import { DateRangeFilter } from "../DateRangeFilter";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  from: string | null;
  to: string | null;
  onApply: (from: string | null, to: string | null) => void;
};

export function DateFilterDrawer({ isOpen, setIsOpen, from, to, onApply }: Props) {
  const { t } = useTranslation(["health"]);
  const [pendingFrom, setPendingFrom] = useState(from);
  const [pendingTo, setPendingTo] = useState(to);

  useEffect(() => {
    if (!isOpen) return;
    setPendingFrom(from);
    setPendingTo(to);
  }, [isOpen, from, to]);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent snapPoints={["45%"]} enableDynamicSizing={false}>
        <DrawerCloseButton />

        <DrawerHeader style={styles.header}>
          <DrawerTitle style={styles.title}>{t("health:recordList.filters.title")}</DrawerTitle>
        </DrawerHeader>

        <DateRangeFilter
          from={pendingFrom}
          to={pendingTo}
          onChangeFrom={setPendingFrom}
          onChangeTo={setPendingTo}
        />

        <DrawerFooter style={styles.footer}>
          <Button
            variant="text"
            size="lg"
            onPress={() => {
              setPendingFrom(null);
              setPendingTo(null);
              onApply(null, null);
              setIsOpen(false);
            }}
          >
            {t("health:recordList.filters.clear")}
          </Button>
          <Button
            variant="primary"
            size="lg"
            style={styles.applyButton}
            onPress={() => {
              onApply(pendingFrom, pendingTo);
              setIsOpen(false);
            }}
          >
            {t("health:recordList.filters.apply")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    gap: theme.spacing(1),
  },
  title: {
    fontSize: theme.fontSize.xl,
    letterSpacing: 0,
  },
  footer: {
    flexDirection: "row",
    gap: theme.spacing(3),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(2),
  },
  applyButton: {
    flex: 1,
  },
}));
