import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";

import { useAuth } from "@/auth/hooks/useAuth";
import { useProfileMeQuery } from "@/home/queries/useProfileMeQuery";
import { PencilLineIcon } from "@/icons/pencil-line";
import { TriangleAlertIcon } from "@/icons/triangle-alert";
import { UserIcon } from "@/icons/user";
import { Button } from "@/shadecn/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadecn/ui/dialog";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { InfoRow } from "../components/InfoRow";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { ProfileMenuRow } from "../components/ProfileMenuRow";
import { SectionHeader } from "../components/SectionHeader";
import { SignOutDrawer } from "../components/SignOutDrawer";
import { UpdateSelectionDialog } from "../components/update-info/UpdateSelectionDialog";
import { useDeleteAccountMutation } from "../queries/useDeleteAccountMutation";
import { ProfileHeroSkeleton, ProfilePageSkeleton } from "../skeletons/ProfilePageSkeleton";
import dayjs from "dayjs";
import { useRouter } from "expo-router";

export default function ProfilePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(["profile", "common"]);
  const { signOut } = useAuth();
  const { data: profile, isLoading } = useProfileMeQuery();
  const { mutateAsync: deleteAccount, isPending: isDeleting } = useDeleteAccountMutation();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const heading = profile?.displayName ?? profile?.email ?? t("profile:profilePage.fallbackName");

  const memberSince =
    profile?.createdAt && dayjs(profile.createdAt).isValid()
      ? dayjs(profile.createdAt).format("MMM D, YYYY")
      : t("profile:profilePage.empty.memberSince");

  const handleSignOut = async () => {
    setIsSignOutOpen(false);
    await signOut();
    router.replace("/(auth)/welcome");
  };

  const handleDeleteAccount = async () => {
    if (!profile?.id) {
      Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
      return;
    }

    try {
      await deleteAccount(profile.id);
      Toast.show({ type: "success", text1: t("profile:deleteSuccessMessage") });
      setIsDeleteOpen(false);
      await signOut();
      router.replace("/(auth)/welcome");
    } catch (e) {
      console.error(e);
      Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{t("profile:profilePage.eyebrow")}</Text>
          <Button
            size="icon"
            variant="icon"
            disabled={!profile}
            onPress={() => setIsEditOpen(true)}
            icon={<PencilLineIcon width={18} height={18} color={palette.brand.primaryDefault} />}
          />
        </View>

        {isLoading ? (
          <ProfileHeroSkeleton />
        ) : (
          <View style={styles.hero}>
            <ProfileAvatar />
            <View style={styles.heroCopy}>
              <Text style={styles.heroName}>{heading}</Text>
              {profile?.displayName && profile?.email ? (
                <Text style={styles.heroEmail}>{profile.email}</Text>
              ) : null}
            </View>
          </View>
        )}

        <SectionHeader label={t("profile:profilePage.sections.details")} />
        {isLoading ? (
          <ProfilePageSkeleton />
        ) : (
          <View style={styles.card}>
            <InfoRow
              label={t("profile:profilePage.fields.phoneNumber")}
              value={profile?.phoneNumber ?? t("profile:profilePage.empty.phoneNumber")}
            />
            <InfoRow label={t("profile:profilePage.fields.memberSince")} value={memberSince} />
          </View>
        )}

        <SectionHeader label={t("profile:profilePage.sections.manage")} />
        <View style={styles.card}>
          <ProfileMenuRow
            icon={<UserIcon width={18} height={18} color={palette.brand.primaryDefault} />}
            label={t("profile:profilePage.menu.signOut")}
            description={t("profile:profilePage.menu.signOutDescription")}
            onPress={() => setIsSignOutOpen(true)}
          />
          <ProfileMenuRow
            icon={<TriangleAlertIcon width={18} height={18} color={palette.brand.danger} />}
            label={t("profile:profilePage.menu.deleteAccount")}
            description={t("profile:profilePage.menu.deleteAccountDescription")}
            tone="danger"
            disabled={!profile}
            onPress={() => setIsDeleteOpen(true)}
          />
        </View>
      </ScrollView>

      {!!profile && <UpdateSelectionDialog isOpen={isEditOpen} setIsOpen={setIsEditOpen} />}

      <SignOutDrawer
        isOpen={isSignOutOpen}
        setIsOpen={setIsSignOutOpen}
        onConfirm={handleSignOut}
      />

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("profile:profilePage.deleteDialog.title")}</DialogTitle>
            <DialogDescription style={styles.deleteDialogDescription}>
              {t("profile:profilePage.deleteDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="danger"
              size="md"
              isLoading={isDeleting}
              disabled={isDeleting}
              onPress={handleDeleteAccount}
            >
              {t("profile:profilePage.deleteDialog.confirm")}
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" size="md" disabled={isDeleting}>
                {t("profile:profilePage.deleteDialog.cancel")}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.palette.brand.surfacePage,
  },
  content: {
    paddingHorizontal: theme.spacing(5),
    paddingBottom: theme.spacing(28),
    gap: theme.spacing(4),
  },
  eyebrow: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: theme.palette.brand.textSecondary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize["2xl"],
    letterSpacing: 0,
    color: theme.palette.brand.textPrimary,
  },
  hero: {
    alignItems: "center",
    gap: theme.spacing(3),
    paddingVertical: theme.spacing(2),
  },
  heroCopy: {
    alignItems: "center",
    gap: theme.spacing(1),
  },
  heroName: {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize.xl,
    color: theme.palette.brand.textPrimary,
  },
  heroEmail: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textSecondary,
  },
  card: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.white,
    shadowColor: theme.palette.brand.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteDialogDescription: {
    textAlign: "center",
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.base,
    lineHeight: theme.fontSize.base * 1.45,
    color: theme.palette.brand.textBody,
  },
}));
