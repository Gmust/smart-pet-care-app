import PetsTabPage from "@/pets/pages/PetsTabPage";

export { RouteErrorFallback as ErrorBoundary } from "@/common/components/RouteErrorFallback";

export default function PetsScreen() {
  return <PetsTabPage />;
}
