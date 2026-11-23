import { useProfileMeQuery } from "@/home/queries/useProfileMeQuery";
import { useGetAvatarById } from "@/profile/queries/useGetAvatarById";

export const useProfileAvatar = () => {
  const { data: profile } = useProfileMeQuery();

  const hasCustomAvatar = !!profile?.customAvatarUrl;
  const { data: customAvatarUri } = useGetAvatarById(hasCustomAvatar ? profile?.id : undefined);

  const avatarUrl = hasCustomAvatar ? customAvatarUri : profile?.googleAvatarUrl;

  const source = profile?.displayName?.trim() || profile?.email?.trim();
  const parts = source?.split(/\s+/).filter(Boolean) ?? [];
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : (source?.slice(0, 2).toUpperCase() ?? "");

  return { avatarUrl, initials };
};
