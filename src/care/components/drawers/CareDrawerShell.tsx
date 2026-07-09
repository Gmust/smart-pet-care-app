import type { ReactNode } from "react";
import { StyleSheet } from "react-native-unistyles";

import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerScrollView,
  DrawerTitle,
} from "@/shadecn/ui/drawer";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  snapPoints: string[];
  title: string;
  footer: ReactNode;
  children: ReactNode;
};

export function CareDrawerShell({ isOpen, setIsOpen, snapPoints, title, footer, children }: Props) {
  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent
        scrollable
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        backdropPressBehavior="none"
      >
        <DrawerCloseButton />

        <DrawerHeader style={styles.header}>
          <DrawerTitle style={styles.title}>{title}</DrawerTitle>
        </DrawerHeader>

        <DrawerScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </DrawerScrollView>

        <DrawerFooter style={styles.footer}>{footer}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: { gap: theme.spacing(1) },
  title: { ...theme.textStyles.titleL, letterSpacing: 0 },
  scroll: { flex: 1 },
  content: { gap: theme.spacing(3), paddingBottom: theme.spacing(3) },
  footer: { paddingTop: theme.spacing(1), backgroundColor: "transparent" },
}));
