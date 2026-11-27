import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Image } from "expo-image";

import { hexToRGBA } from "@/common/utils/colors";
import { ImageEdit } from "@/icons/image-edit";
import { UserIcon } from "@/icons/user";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

type Props = {
  avatarUrl?: string | null;
  initials: string;
};

// Rendered inside the drawer portal, which sits outside the QueryClientProvider: no query hooks here.
export const AvatarPickerPlaceholder = ({ avatarUrl, initials }: Props) => {
  const { theme } = useUnistyles();

  return (
    <View style={styles.root}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={[styles.image, styles.fallback]}>
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
      )}
      <View style={styles.scrim}>
        <ImageEdit
          width={theme.iconSize.xl}
          height={theme.iconSize.xl}
          color={theme.palette.white}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    alignSelf: "stretch",
  },
  image: {
    flex: 1,
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.brand.primaryXsoft,
  },
  initials: {
    color: theme.palette.brand.primaryDefault,
  },
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing(2.5),
    backgroundColor: hexToRGBA(theme.palette.brand.primaryDark, 0.55),
  },
}));
