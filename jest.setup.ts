const { ReadableStream: NodeReadableStream } = require("stream/web");

Object.defineProperty(globalThis, "ReadableStream", {
  configurable: true,
  value: NodeReadableStream,
  writable: true,
});

jest.mock("react-native-keyboard-controller", () =>
  require("react-native-keyboard-controller/jest")
);

// Lightweight manual mock: the real package initializes native Worklets, which is
// unavailable under Jest. Only the surface used by animated components is stubbed.
jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");
  const identity = <T>(value: T): T => value;
  const easingFn = (value: number) => value;

  // Layout/entering/exiting animations are chained (e.g. FadeIn.duration(220)); every
  // builder method returns the same chainable stub so any call sequence resolves.
  const chainable: Record<string, unknown> = new Proxy({}, { get: () => () => chainable });

  return {
    __esModule: true,
    default: { View },
    View,
    useSharedValue: (value: unknown) => ({ value }),
    useAnimatedStyle: () => ({}),
    withTiming: identity,
    withRepeat: identity,
    withSpring: identity,
    cancelAnimation: () => undefined,
    Easing: { inOut: () => easingFn, ease: easingFn },
    FadeIn: chainable,
    FadeOut: chainable,
    LinearTransition: chainable,
  };
});
