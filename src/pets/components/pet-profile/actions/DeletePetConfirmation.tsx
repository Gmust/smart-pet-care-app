import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";

import { DeleteConfirmDialog } from "@/common/components/DeleteConfirmDialog";
import { useDeletePet } from "@/pets/queries/useDeletePet";
import type { DialogHandler } from "@/shadecn/ui/dialog";

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

    await deletePet(petId);
    Toast.show({ type: "success", text1: t("pets:deleteSuccessMessage") });
    router.replace("/(tabs)/pets");
  };

  return (
    <DeleteConfirmDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title={t("pets:petProfilePage.deleteDialog.title")}
      description={t("pets:petProfilePage.deleteDialog.description", { name: petName })}
      isDeleting={isPetDeleting}
      onConfirm={handleDeletePet}
    />
  );
};
