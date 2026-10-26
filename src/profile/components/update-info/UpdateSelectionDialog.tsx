import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { ActionRow } from "@/common/components/ActionRow";
import { ImageEdit } from "@/icons/image-edit";
import { UserIcon } from "@/icons/user";
import type { DialogHandler } from "@/shadecn/ui/dialog";
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shadecn/ui/dialog";

import { EditProfileDrawer } from "./EditProfileDrawer";
import { UpdateAvatarDrawer } from "./UpdateAvatarDrawer";

type Props = DialogHandler;

export const UpdateSelectionDialog = ({ isOpen, setIsOpen }: Props) => {
  const { t } = useTranslation(["profile"]);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isNewAvatarOpen, setIsNewAvatarOpen] = useState(false);

  const handleOpenEditProfile = () => {
    setIsEditProfileOpen(true);
    setIsOpen(false);
  };

  const handleSetNewAvatar = () => {
    setIsNewAvatarOpen(true);
    setIsOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogCloseButton />

          <DialogHeader>
            <DialogTitle>{t("editSelectionDialog.title")}</DialogTitle>
          </DialogHeader>

          <View style={styles.content}>
            <ActionRow
              size="lg"
              icon={ImageEdit}
              label={t("editSelectionDialog.newAvatarBtn")}
              onPress={handleSetNewAvatar}
            />
            <ActionRow
              size="lg"
              icon={UserIcon}
              label={t("editSelectionDialog.profileInfoBtn")}
              onPress={handleOpenEditProfile}
            />
          </View>
        </DialogContent>
      </Dialog>
      <EditProfileDrawer isOpen={isEditProfileOpen} setIsOpen={setIsEditProfileOpen} />
      <UpdateAvatarDrawer isOpen={isNewAvatarOpen} setIsOpen={setIsNewAvatarOpen} />
    </>
  );
};

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing(1),
  },
}));
