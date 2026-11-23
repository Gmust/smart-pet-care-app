import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import dayjs from "dayjs";
import { useRouter } from "expo-router";

import { useAuth } from "@/auth/hooks/useAuth";
import { DeleteConfirmDialog } from "@/common/components/DeleteConfirmDialog";
import { SettingRow } from "@/common/components/SettingRow";
import { NAVIGATION_PRESS_HIGHLIGHT_DELAY_MS } from "@/common/constants";
import { openLegalUrl, PRIVACY_URL, TERMS_URL } from "@/common/utils/legalUrls";
import { useProfileMeQuery } from "@/home/queries/useProfileMeQuery";
import { TriangleAlertIcon } from "@/icons/alert";
import { FileTextIcon } from "@/icons/file-text";
import { LayoutListIcon } from "@/icons/layout-list";
import { PencilLineIcon } from "@/icons/pencil-line";
import { ShieldIcon } from "@/icons/shield";
import { UserIcon } from "@/icons/user";
import { usePetListMode } from "@/pets/hooks/usePetListMode";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { InfoRow } from "../components/InfoRow";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { ProfileLinkRow } from "../components/ProfileLinkRow";
import { ProfileMenuRow } from "../components/ProfileMenuRow";
import { SectionHeader } from "../components/SectionHeader";
import { SignOutDrawer } from "../components/SignOutDrawer";
import { EditProfileDrawer } from "../components/update-info/EditProfileDrawer";
import { useDeleteAccountMutation } from "../queries/useDeleteAccountMutation";
import { ProfileHeroSkeleton, ProfilePageSkeleton } from "../skeletons/ProfilePageSkeleton";

export default function ProfilePage() {
  const router = useRouter();
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(["profile", "common"]);
  const { signOut } = useAuth();
  const { isListEnabled, setMode } = usePetListMode();
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

    await deleteAccount(profile.id);
    Toast.show({ type: "success", text1: t("profile:deleteSuccessMessage") });
    await signOut();
    router.replace("/(auth)/welcome");
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="body" style={styles.eyebrow}>
            {t("profile:profilePage.eyebrow")}
          </Text>
          <Button
            size="icon"
            variant="icon"
            accessibilityLabel={t("profile:profilePage.editProfile")}
            disabled={!profile}
            onPress={() => setIsEditOpen(true)}
            icon={
              <PencilLineIcon
                width={theme.iconSize.lg}
                height={theme.iconSize.lg}
                color={palette.brand.primaryDefault}
              />
            }
          />
        </View>

        {isLoading ? (
          <ProfileHeroSkeleton />
        ) : (
          <View style={styles.hero}>
            <ProfileAvatar />
            <View style={styles.heroCopy}>
              <Text variant="titleL" style={styles.heroName}>
                {heading}
              </Text>
              {profile?.displayName && profile?.email ? (
                <Text variant="bodyS" style={styles.heroEmail}>
                  {profile.email}
                </Text>
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

        <SectionHeader label={t("profile:profilePage.sections.customize")} />
        <View style={styles.card}>
          <SettingRow
            icon={
              <LayoutListIcon
                width={theme.iconSize.md}
                height={theme.iconSize.md}
                color={palette.brand.primaryDefault}
              />
            }
            title={t("profile:profilePage.customize.toggleTitle")}
            subtitle={t("profile:profilePage.customize.toggleSubtitle")}
            checked={isListEnabled}
            onCheckedChange={(checked) => setMode(checked ? "on" : "off")}
          />
          <ProfileLinkRow
            label={t("profile:profilePage.customize.seeHow")}
            onPress={() => router.navigate("/(tabs)/pet-list-settings")}
          />
        </View>

        <SectionHeader label={t("profile:profilePage.sections.manage")} />
        <View style={styles.card}>
          <ProfileMenuRow
            icon={
              <UserIcon
                width={theme.iconSize.lg}
                height={theme.iconSize.lg}
                color={palette.brand.primaryDefault}
              />
            }
            label={t("profile:profilePage.menu.signOut")}
            description={t("profile:profilePage.menu.signOutDescription")}
            onPress={() => setIsSignOutOpen(true)}
          />
          <ProfileMenuRow
            icon={
              <TriangleAlertIcon
                width={theme.iconSize.lg}
                height={theme.iconSize.lg}
                color={palette.brand.danger}
              />
            }
            label={t("profile:profilePage.menu.deleteAccount")}
            description={t("profile:profilePage.menu.deleteAccountDescription")}
            tone="danger"
            disabled={!profile}
            onPress={() => setIsDeleteOpen(true)}
          />
        </View>

        <SectionHeader label={t("profile:profilePage.sections.legal")} />
        <View style={styles.card}>
          <ProfileMenuRow
            icon={
              <FileTextIcon
                width={theme.iconSize.lg}
                height={theme.iconSize.lg}
                color={palette.brand.primaryDefault}
              />
            }
            label={t("profile:profilePage.menu.terms")}
            description={t("profile:profilePage.menu.termsDescription")}
            pressDelay={NAVIGATION_PRESS_HIGHLIGHT_DELAY_MS}
            onPress={() => openLegalUrl(TERMS_URL)}
          />
          <ProfileMenuRow
            icon={
              <ShieldIcon
                width={theme.iconSize.lg}
                height={theme.iconSize.lg}
                color={palette.brand.primaryDefault}
              />
            }
            label={t("profile:profilePage.menu.privacy")}
            description={t("profile:profilePage.menu.privacyDescription")}
            pressDelay={NAVIGATION_PRESS_HIGHLIGHT_DELAY_MS}
            onPress={() => openLegalUrl(PRIVACY_URL)}
          />
        </View>
      </ScrollView>

      {!!profile && <EditProfileDrawer isOpen={isEditOpen} setIsOpen={setIsEditOpen} />}

      <SignOutDrawer
        isOpen={isSignOutOpen}
        setIsOpen={setIsSignOutOpen}
        onConfirm={handleSignOut}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        title={t("profile:profilePage.deleteDialog.title")}
        description={t("profile:profilePage.deleteDialog.description")}
        isDeleting={isDeleting}
        onConfirm={handleDeleteAccount}
      />
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
    gap: theme.spacing(2),
  },
  eyebrow: {
    textTransform: "uppercase",
    color: theme.palette.brand.textSecondary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hero: {
    alignItems: "center",
    gap: theme.spacing(3),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
  },
  heroCopy: {
    alignItems: "center",
    gap: theme.spacing(1),
  },
  heroName: {
    color: theme.palette.brand.textPrimary,
  },
  heroEmail: {
    color: theme.palette.brand.textSecondary,
  },
  card: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.white,
    boxShadow: theme.shadows.card,
    marginBottom: theme.spacing(4),
  },
}));
