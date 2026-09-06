import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

type Props = {
  fallback: ReactNode;
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

/**
 * expo-maps is a native module. When the running binary was built before it was
 * installed — a stale `android/` project, a dev client that predates the
 * dependency, or Expo Go — rendering the map view throws instead of failing
 * gracefully, taking the whole screen down with it.
 *
 * A timeout can't catch that: the throw happens during render, before the map
 * ever reports whether it loaded. This boundary turns that crash into the same
 * "map unavailable" fallback a missing API key produces.
 */
export class MapErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Map failed to render", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
