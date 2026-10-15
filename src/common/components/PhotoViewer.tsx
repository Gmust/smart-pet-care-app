import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, type StyleProp, type ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Image } from "expo-image";

type Props = {
  uri: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

// Wraps a thumbnail; tapping it shows the full photo. Tap anywhere or Android back closes.
export const PhotoViewer = ({ uri, children, style }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation(["common"]);

  return (
    <>
      <Pressable
        accessibilityRole="imagebutton"
        accessibilityLabel={t("actions.viewPhoto")}
        style={style}
        onPress={() => setIsOpen(true)}
      >
        {children}
      </Pressable>
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("actions.close")}
          style={styles.backdrop}
          onPress={() => setIsOpen(false)}
        >
          <Image source={{ uri }} style={styles.photo} contentFit="contain" />
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create((theme) => ({
  backdrop: {
    flex: 1,
    backgroundColor: theme.palette.black,
  },
  photo: {
    flex: 1,
  },
}));
