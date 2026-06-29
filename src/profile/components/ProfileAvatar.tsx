import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useProfileMeQuery } from "@/home/queries/useProfileMeQuery";
import { UserIcon } from "@/icons/user";
import { useGetAvatarById } from "@/profile/queries/useGetAvatarById";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { Image } from "expo-image";

const getInitials = (displayName?: string | null, email?: string | null): string => {
  const source = displayName?.trim() || email?.trim();
  if (!source) return "";

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
};

export function ProfileAvatar() {
  const { data: profile } = useProfileMeQuery();

  const hasCustomAvatar = !!profile?.customAvatarUrl;
  const { data: customAvatarUri } = useGetAvatarById(hasCustomAvatar ? profile?.id : undefined);

  const avatarUrl = hasCustomAvatar ? customAvatarUri : profile?.googleAvatarUrl;
  const initials = getInitials(profile?.displayName, profile?.email);

  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />;
  }

  return (
    <View style={[styles.avatar, styles.fallback]}>
      {initials ? (
        <Text style={styles.initials}>{initials}</Text>
      ) : (
        <UserIcon width={32} height={32} color={palette.brand.primaryDefault} />
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  avatar: {
    width: theme.spacing(20),
    height: theme.spacing(20),
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    backgroundColor: theme.palette.brand.primaryXsoft,
  },
  initials: {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize["2xl"],
    color: theme.palette.brand.primaryDefault,
  },
}));
