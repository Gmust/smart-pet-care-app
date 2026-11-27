import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Image } from "expo-image";

import { PhotoViewer } from "@/common/components/PhotoViewer";
import { UserIcon } from "@/icons/user";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { useProfileAvatar } from "../hooks/useProfileAvatar";

export function ProfileAvatar() {
  const { theme } = useUnistyles();
  const { avatarUrl, initials } = useProfileAvatar();

  if (avatarUrl) {
    return (
      <PhotoViewer uri={avatarUrl}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
      </PhotoViewer>
    );
  }

  return (
    <View style={[styles.avatar, styles.fallback]}>
      {initials ? (
        <Text variant="titleL" style={styles.initials}>
          {initials}
        </Text>
      ) : (
        <UserIcon
          width={theme.iconSize["3xl"]}
          height={theme.iconSize["3xl"]}
          color={palette.brand.primaryDefault}
        />
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
    color: theme.palette.brand.primaryDefault,
  },
}));
