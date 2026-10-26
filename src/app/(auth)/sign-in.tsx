import SignInPage from "@/auth/pages/SignInPage";

export { RouteErrorFallback as ErrorBoundary } from "@/common/components/RouteErrorFallback";

export default function SignInScreen() {
  return <SignInPage />;
}
