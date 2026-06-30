import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";

import { useDeletePet } from "@/pets/queries/useDeletePet";
import { Button } from "@/shadecn/ui/button";
import type { DialogHandler } from "@/shadecn/ui/dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadecn/ui/dialog";

import { useRouter } from "expo-router";

type Props = DialogHandler & {
  petName: string;
  petId: string;
};

export const DeletePetConfirmation = ({ isOpen, setIsOpen, petId, petName }: Props) => {
  const { t } = useTranslation(["common", "pets"]);

  const router = useRouter();

  const { mutateAsync: deletePet, isPending: isPetDeleting } = useDeletePet();

  const handleDeletePet = async () => {
    if (!petId) {
      Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
      return;
    }

    try {
      await deletePet(petId);
      Toast.show({ type: "success", text1: t("pets:deleteSuccessMessage") });
      setIsOpen(false);
      router.replace("/(tabs)/pets");
    } catch (e) {
      console.error(e);
      Toast.show({ type: "error", text1: t("common:errors.somethingWentWrong") });
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("pets:petProfilePage.deleteDialog.title")}</DialogTitle>
          <DialogDescription style={styles.deleteDialogDescription}>
            {t("pets:petProfilePage.deleteDialog.description", { name: petName })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="danger"
            size="md"
            isLoading={isPetDeleting}
            disabled={isPetDeleting}
            onPress={handleDeletePet}
          >
            {t("pets:petProfilePage.deleteDialog.confirm")}
          </Button>

          <DialogClose asChild>
            <Button variant="ghost" size="md" disabled={isPetDeleting}>
              {t("pets:petProfilePage.deleteDialog.cancel")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const styles = StyleSheet.create((theme) => ({
  deleteDialogDescription: {
    textAlign: "center",
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.base,
    lineHeight: theme.fontSize.base * 1.45,
    color: theme.palette.brand.textBody,
  },
}));
