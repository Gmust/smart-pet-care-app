import { StyleSheet } from "react-native-unistyles";

import { Drawer, DrawerContent } from "@/shadecn/ui/drawer";

import { GoogleConsentSheet } from "./GoogleConsentSheet";

interface GoogleConsentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgree: () => void;
  /** Fires once the sheet has finished closing, however it was closed. */
  onDismiss: () => void;
}

export const GoogleConsentDrawer = ({
  open,
  onOpenChange,
  onAgree,
  onDismiss,
}: GoogleConsentDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent contentStyle={styles.content} onDismiss={onDismiss}>
        <GoogleConsentSheet onAgree={onAgree} />
      </DrawerContent>
    </Drawer>
  );
};

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing(4),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(3),
  },
}));
