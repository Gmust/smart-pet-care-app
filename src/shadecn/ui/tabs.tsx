import { useCallback, useEffect, useRef } from "react";
import type { LayoutChangeEvent } from "react-native";
import { Pressable, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./text";

export type TabItem = {
  key: string;
  label: string;
};

export type TabsVariant = "segmented" | "pill";

type TabLayout = { x: number; width: number };

const tabsVariants = StyleSheet.create((theme) => {
  const { brand } = theme.palette;

  return {
    container: {
      variants: {
        variant: {
          segmented: {
            flexDirection: "row",
            alignItems: "flex-start",
            borderWidth: 1,
            borderColor: brand.surfaceBorder,
            backgroundColor: theme.palette.white,
            paddingHorizontal: theme.spacing(5),
          },
          pill: {
            flexDirection: "row",
            gap: theme.spacing(2),
          },
        },
      },
    },

    indicator: {
      position: "absolute",
      variants: {
        variant: {
          segmented: {
            bottom: 0,
            height: 2,
            backgroundColor: brand.primaryDefault,
          },
          pill: {
            top: 0,
            bottom: 0,
            borderRadius: theme.borderRadius.full,
            borderWidth: 1,
            borderColor: brand.primaryDefault,
            backgroundColor: brand.primarySoft,
          },
        },
      },
    },

    tab: {
      variants: {
        variant: {
          segmented: {
            flex: 1,
            minWidth: 0,
            alignItems: "center",
            justifyContent: "center",
            padding: theme.spacing(2.5),
          },
          pill: {
            paddingHorizontal: theme.spacing(3.5),
            paddingVertical: theme.spacing(1.5),
          },
        },
      },
    },

    text: (active: boolean = false) => ({
      variants: {
        variant: {
          segmented: {
            fontFamily: active ? theme.fonts.semiBold : theme.fonts.regular,
            fontSize: active ? theme.fontSize.sm : theme.fontSize.xs,
            lineHeight: (active ? theme.fontSize.sm : theme.fontSize.xs) * 1.4,
            color: active ? brand.primaryDefault : brand.textSecondary,
          },
          pill: {
            fontFamily: active ? theme.fonts.semiBold : theme.fonts.medium,
            fontSize: theme.fontSize.xs,
            color: active ? brand.primaryDark : brand.textSecondary,
          },
        },
      },
    }),
  };
});

const INDICATOR_TRANSITION = {
  duration: 220,
  easing: Easing.out(Easing.cubic),
};

const tabsContentEntering = FadeIn.duration(220).easing(Easing.out(Easing.cubic));

type TabsProps = {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  variant?: TabsVariant;
};

export function Tabs({ items, value, onChange, variant = "segmented" }: TabsProps) {
  tabsVariants.useVariants({ variant });

  const layouts = useRef<Record<string, TabLayout>>({}).current;
  const hasPositionedIndicator = useRef(false);
  const translateX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  const moveIndicator = useCallback(
    (key: string) => {
      const layout = layouts[key];
      if (!layout) return;
      translateX.value = withTiming(layout.x, INDICATOR_TRANSITION);
      indicatorWidth.value = withTiming(layout.width, INDICATOR_TRANSITION);
    },
    [layouts, translateX, indicatorWidth]
  );

  useEffect(() => {
    moveIndicator(value);
  }, [value, moveIndicator]);

  const handleLayout = useCallback(
    (key: string) => (event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      layouts[key] = { x, width };
      if (key === value) {
        if (!hasPositionedIndicator.current) {
          translateX.value = x;
          indicatorWidth.value = width;
          hasPositionedIndicator.current = true;
          return;
        }

        moveIndicator(key);
      }
    },
    [layouts, value, translateX, indicatorWidth, moveIndicator]
  );

  const indicatorAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: indicatorWidth.value,
  }));

  return (
    <View style={tabsVariants.container}>
      <Animated.View style={[tabsVariants.indicator, indicatorAnimatedStyle]} />
      {items.map((item) => {
        const active = item.key === value;

        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(item.key)}
            onLayout={handleLayout(item.key)}
            style={tabsVariants.tab}
          >
            <Text style={tabsVariants.text(active)} numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export { tabsContentEntering, tabsVariants };
