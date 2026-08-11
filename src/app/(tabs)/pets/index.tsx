import PetListPage from "@/pets/pages/PetListPage";

export { RouteErrorFallback as ErrorBoundary } from "@/common/components/RouteErrorFallback";

export default function PetsScreen() {
  return <PetListPage />;
}
