import { useProfileMeQuery } from "../queries/useProfileMeQuery";
import { HeaderSectionSkeleton } from "../skeletons/HomePageSkeleton";
import { HomeHeader } from "./HomeHeader";

export function HeaderSection() {
  const { data: profile, isLoading } = useProfileMeQuery();

  const username = profile?.displayName ?? profile?.email;

  if (isLoading) {
    return <HeaderSectionSkeleton />;
  }

  return <HomeHeader username={username ?? ""} />;
}
