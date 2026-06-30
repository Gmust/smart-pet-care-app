import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchApiPetsIdPhoto } from "@/api";
import { asFormFile } from "@/api/rnFormFile";
import type { ImagePickerValue } from "@/common/components/ImagePicker";
import { toSourceUri } from "@/common/utils/toSourceUri";

import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

type Payload = {
  image: ImagePickerValue;
  petId: string;
};

export const useUploadPetPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["upload-pet-photo"],
    mutationFn: async ({ image, petId }: Payload) => {
      const sourceUri = toSourceUri(image.uri);

      const manipulator = ImageManipulator.manipulate(sourceUri);
      const rendered = await manipulator.renderAsync();
      const resized = await rendered.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });

      const photo = asFormFile({
        uri: resized.uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      });

      // RN's FormData isn't detected by axios, so force multipart so the native
      // networking layer serializes the body with a boundary instead of urlencoded.
      const { data } = await patchApiPetsIdPhoto(
        petId,
        { photo },
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
    },
  });
};
