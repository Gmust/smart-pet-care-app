import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postApiProfileAvatar } from "@/api";
import { asFormFile } from "@/api/rnFormFile";
import type { ImagePickerValue } from "@/common/components/ImagePicker";
import { toSourceUri } from "@/common/utils/toSourceUri";

import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

// Avatars render small, so cap the long edge and recompress as JPEG before
// upload. Full-resolution camera photos otherwise blow past the server body
// limit (HTTP 413).
const AVATAR_MAX_SIZE = 512;

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-avatar"],
    mutationFn: async (image: ImagePickerValue) => {
      const sourceUri = toSourceUri(image.uri);

      // Resize the longer edge to AVATAR_MAX_SIZE and let the other edge scale
      // proportionally, but only when it actually exceeds the cap — never upscale.
      // Falls back to capping width when dimensions are unknown.
      const manipulator = ImageManipulator.manipulate(sourceUri);
      const { width, height } = image;
      if (width && height) {
        if (Math.max(width, height) > AVATAR_MAX_SIZE) {
          manipulator.resize(
            width >= height ? { width: AVATAR_MAX_SIZE } : { height: AVATAR_MAX_SIZE }
          );
        }
      } else {
        manipulator.resize({ width: AVATAR_MAX_SIZE });
      }

      const rendered = await manipulator.renderAsync();
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
