import { PetListSuggestionDrawer } from "../components/PetListSuggestionDrawer";
import { usePetListMode } from "../hooks/usePetListMode";

import PetListPage from "./PetListPage";
import PetProfilePage from "./PetProfilePage";

export default function PetsTabPage() {
  const { isLoaded, isListEnabled } = usePetListMode();

  if (!isLoaded) return null;

  if (isListEnabled) return <PetListPage />;

  return (
    <>
      <PetProfilePage />
      <PetListSuggestionDrawer />
    </>
  );
}
