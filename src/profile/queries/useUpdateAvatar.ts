import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postApiProfileAvatar } from "@/api";
import type { UserResponseDto } from "@/api/generated";
import { asFormFile } from "@/api/rnFormFile";
import type { ImagePickerValue } from "@/common/components/ImagePicker";

import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

// Avatars render small, so cap the long edge and recompress as JPEG before
// upload. Full-resolution camera photos otherwise blow past the server body
// limit (HTTP 413).
const AVATAR_MAX_SIZE = 512;

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-avatar"],
    mutationFn: async (image: ImagePickerValue): Promise<UserResponseDto> => {
      const sourceUri = /^\w+:\/\//.test(image.uri) ? image.uri : `file://${image.uri}`;

      const rendered = await ImageManipulator.manipulate(sourceUri)
        .resize({ width: AVATAR_MAX_SIZE })
        .renderAsync();
      const resized = await rendered.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });

      const file = asFormFile({
        uri: resized.uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      });

      // RN's FormData isn't detected by axios, so force multipart so the native
      // networking layer serializes the body with a boundary instead of urlencoded.
      const { data } = await postApiProfileAvatar(
        { file },
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      queryClient.invalidateQueries({ queryKey: ["get-avatar"] });
    },
  });
};
