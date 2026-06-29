import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Button } from "@/shadecn/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shadecn/ui/drawer";
import { Text } from "@/shadecn/ui/text";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onConfirm: () => void;
};

export const SignOutDrawer = ({ isOpen, setIsOpen, onConfirm }: Props) => {
  const { t } = useTranslation(["profile"]);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("profile:profilePage.signOutDrawer.title")}</DrawerTitle>
          <DrawerDescription>
            {t("profile:profilePage.signOutDrawer.description")}
          </DrawerDescription>
        </DrawerHeader>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("profile:profilePage.signOutDrawer.cardTitle")}</Text>
          <Text style={styles.cardDescription}>
            {t("profile:profilePage.signOutDrawer.cardDescription")}
          </Text>
        </View>
        <DrawerFooter>
          <Button size="md" variant="primary" onPress={onConfirm}>
            {t("profile:profilePage.signOutDrawer.confirm")}
          </Button>
          <DrawerClose asChild>
            <Button size="md">{t("profile:profilePage.signOutDrawer.cancel")}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.spacing(1.5),
    borderRadius: theme.borderRadius["3xl"],
    backgroundColor: theme.palette.brand.surfaceSunken,
    padding: theme.spacing(4),
  },
  cardTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.sm,
    textTransform: "uppercase",
    color: theme.palette.brand.textPrimary,
  },
  cardDescription: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.fontSize.sm * 1.3,
    color: theme.palette.brand.textBody,
  },
}));
