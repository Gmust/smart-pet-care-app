import WelcomePage from "@/auth/pages/WelcomePage";

export { RouteErrorFallback as ErrorBoundary } from "@/common/components/RouteErrorFallback";

export default function WelcomeScreen() {
  return <WelcomePage />;
}
