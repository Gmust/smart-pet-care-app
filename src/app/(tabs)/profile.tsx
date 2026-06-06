import { useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";

import { useAuth } from "@/auth/hooks/useAuth";
import { CatIcon } from "@/icons/pets";
import Utensils from "@/icons/utensils";
import { Button } from "@/shadecn/ui/button";
import { Chip } from "@/shadecn/ui/chip";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadecn/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shadecn/ui/drawer";
import { Input } from "@/shadecn/ui/input";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { useRouter } from "expo-router";

export default function ProfilePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/welcome");
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Profile</Text>
        <Text style={styles.title}>Quick actions</Text>
        <Text style={styles.description}>
          Use the new drawer primitive for focused mobile actions and confirmation flows.
        </Text>
      </View>
      <View>
        <Chip label="Test" />
        <CatIcon color={palette.amber[400]} />
        <Utensils.Default color={palette.amber[400]} />
      </View>
      <View style={styles.showcase}>
        <Text style={styles.showcaseLabel}>Input primitive</Text>
        <Input size="md" placeholder="Pet nickname" />
        <Button size="md" variant="primary" onPress={() => setIsDialogOpen(true)}>
          Open test dialog
        </Button>
      </View>
      <View style={styles.showcase}>
        <Text style={styles.showcaseLabel}>Toast primitive</Text>
        <View style={styles.toastGrid}>
          <Button
            size="sm"
            variant="secondary"
            style={styles.toastButton}
            onPress={() =>
              Toast.show({
                type: "success",
                text1: "Saved",
                text2: "Bella's feeding schedule was updated.",
              })
            }
          >
            Success
          </Button>
          <Button
            size="sm"
            variant="ghost"
            style={styles.toastButton}
            onPress={() =>
              Toast.show({
                type: "info",
                text1: "Update",
                text2: "Vet visit details synced across devices.",
              })
            }
          >
            Info
          </Button>
          <Button
            size="sm"
            variant="ghost"
            style={styles.toastButton}
            onPress={() =>
              Toast.show({
                type: "warning",
                text1: "Reminder",
                text2: "Medication reminder is due in 15 minutes.",
              })
            }
          >
            Warning
          </Button>
          <Button
            size="sm"
            variant="danger"
            style={styles.toastButton}
            onPress={() =>
              Toast.show({
                type: "error",
                text1: "Needs attention",
                text2: "Could not save the profile test change.",
              })
            }
          >
            Error
          </Button>
        </View>
      </View>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog primitive</DialogTitle>
            <DialogDescription>
              This is a quick smoke test for the existing dialog component.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button size="md">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Drawer>
        <DrawerTrigger asChild>
          <Pressable style={styles.trigger}>
            <Text style={styles.triggerEyebrow}>Reusable component</Text>
            <Text style={styles.triggerTitle}>Open sign out drawer</Text>
            <Text style={styles.triggerDescription}>
              Gorhom Bottom Sheet with a shadcn-style API and Unistyles styling.
            </Text>
          </Pressable>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Leave this device?</DrawerTitle>
            <DrawerDescription>
              You will be signed out on this device only. Your pets and schedules will stay synced
              to your account.
            </DrawerDescription>
          </DrawerHeader>
          <View style={styles.drawerCard}>
            <Text style={styles.drawerCardTitle}>Before you go</Text>
            <Text style={styles.drawerCardDescription}>
              Make sure your recent care logs are synced before switching accounts.
            </Text>
          </View>
          <DrawerFooter>
            <Button size="md" variant="primary" onPress={handleSignOut}>
              Sign out
            </Button>
            <DrawerClose asChild>
              <Button size="md">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    gap: theme.spacing(6),
    backgroundColor: theme.palette.brand.surfacePage,
    paddingHorizontal: theme.spacing(5),
    paddingTop: theme.spacing(8),
  },
  header: {
    gap: theme.spacing(2),
  },
  eyebrow: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.sm,
    textTransform: "uppercase",
    color: theme.palette.cyan[400],
  },
  title: {
    fontFamily: theme.fonts.black,
    fontSize: theme.fontSize["4xl"],
    textTransform: "uppercase",
    color: theme.palette.white,
  },
  description: {
    maxWidth: 320,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.base,
    lineHeight: theme.textSizing(1.4),
    color: theme.palette.slate[300],
  },
  trigger: {
    gap: theme.spacing(2),
    borderRadius: theme.borderRadius["4xl"],
    backgroundColor: theme.palette.white,
    padding: theme.spacing(5),
  },
  showcase: {
    gap: theme.spacing(2),
  },
  toastGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  toastButton: {
    minWidth: theme.spacing(24),
    flexGrow: 1,
  },
  showcaseLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    color: theme.palette.slate[300],
  },
  triggerEyebrow: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    color: theme.palette.cyan[600],
  },
  triggerTitle: {
    fontFamily: theme.fonts.black,
    fontSize: theme.fontSize["2xl"],
    textTransform: "uppercase",
    color: theme.palette.slate[950],
  },
  triggerDescription: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.base,
    lineHeight: theme.textSizing(1.35),
    color: theme.palette.slate[600],
  },
  drawerCard: {
    gap: theme.spacing(1.5),
    borderRadius: theme.borderRadius["3xl"],
    backgroundColor: theme.palette.slate[100],
    padding: theme.spacing(4),
  },
  drawerCardTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.sm,
    textTransform: "uppercase",
    color: theme.palette.slate[950],
  },
  drawerCardDescription: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.textSizing(1.3),
    color: theme.palette.slate[600],
  },
}));
