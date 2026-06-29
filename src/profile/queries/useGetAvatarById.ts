import { useQuery } from "@tanstack/react-query";

import { api } from "@/api";

export const useGetAvatarById = (userId?: string) => {
  return useQuery({
    enabled: !!userId,
    queryKey: ["get-avatar", userId],
    queryFn: async () => {
      if (!userId) return null;

      // Endpoint streams raw image bytes. Read as a Blob and turn it into a
      // base64 data URI (mime taken from the Blob) so expo-image can render it.
      const { data } = await api.get<Blob>(`/api/profile/avatar/${userId}`, {
        responseType: "blob",
      });

      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error);
        reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : "");
        reader.readAsDataURL(data);
      });
    },
  });
};
