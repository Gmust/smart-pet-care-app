import { useTranslation } from "react-i18next";
import { Keyboard, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { BackButton } from "@/common/components/BackButton";
import { PlusIcon } from "@/icons/plus";
import { Button } from "@/shadecn/ui/button";

import { FocusHeading } from "./FocusHeading";

type Props = {
  setNewChatDialogOpen: (value: boolean) => void;
};

export const ChatHeader = ({ setNewChatDialogOpen }: Props) => {
  const { t } = useTranslation(["assistant"]);

  return (
    <View style={styles.header}>
      <View style={styles.headerBar}>
        <BackButton />
        <FocusHeading text={t("title")} />
        <Button
          variant="icon"
          size="icon"
          accessibilityLabel={t("conversation.reset")}
          accessibilityHint={t("hints.reset")}
          onPress={() => {
            Keyboard.dismiss();
            setNewChatDialogOpen(true);
          }}
        >
          <PlusIcon width={18} height={18} color={styles.headerIcon.color} />
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.brand.surfaceBorder,
    paddingHorizontal: theme.spacing(4),
    backgroundColor: theme.palette.brand.surfacePage,
  },
  headerBar: {
    minHeight: theme.spacing(11),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIcon: { color: theme.palette.brand.primaryDark },
}));
