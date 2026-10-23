import { useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { Pressable, View } from "react-native";
import Animated, { Easing, FadeIn, LinearTransition } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./text";

export type TabItem<K extends string = string> = {
  key: K;
  label: string;
};

export type TabsVariant = "segmented" | "pill" | "chips";

export type TabsTone = "primary" | "peach";

type TabLayout = { x: number; width: number };

const tabsVariants = StyleSheet.create((theme) => {
  const { brand } = theme.palette;

  const accent = (tone: TabsTone) => (tone === "peach" ? brand.peachDefault : brand.primaryDefault);

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
          chips: {
            flexDirection: "row",
            gap: theme.spacing(2),
          },
        },
      },
    },

    // `tone` is a style argument, not a variant axis: `pill` carries its own colours, which an axis
    // would override.
    indicator: (tone: TabsTone = "primary") => ({
      position: "absolute",
      variants: {
        variant: {
          segmented: {
            bottom: 0,
            height: 2,
            backgroundColor: accent(tone),
          },
          pill: {
            top: 0,
            bottom: 0,
            borderRadius: theme.borderRadius.full,
            borderWidth: 1,
            borderColor: brand.primaryDefault,
            backgroundColor: brand.primarySoft,
          },
          chips: {
            top: 0,
            bottom: 0,
            borderRadius: theme.borderRadius.full,
            backgroundColor: brand.primarySoft,
          },
        },
      },
    }),

    tab: (active: boolean = false) => ({
      variants: {
        variant: {
          segmented: {
            // Sized from the label: `flex: 1` pins flexBasis to 0, giving every tab the same width
            // and clipping the longest label.
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: "auto",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: theme.spacing(2.5),
            paddingHorizontal: theme.spacing(2.5),
          },
          pill: {
            paddingHorizontal: theme.spacing(3.5),
            paddingVertical: theme.spacing(1.5),
          },
          chips: {
            paddingHorizontal: theme.spacing(2.75),
            paddingVertical: theme.spacing(1.25),
            borderRadius: theme.borderRadius.full,
            borderWidth: theme.spacing(0.25),
            borderColor: active ? theme.palette.transparent : brand.surfaceBorder,
          },
        },
      },
    }),

    text: (active: boolean = false, tone: TabsTone = "primary") => ({
      variants: {
        variant: {
          segmented: {
            color: active ? accent(tone) : brand.textSecondary,
          },
          pill: {
            fontFamily: active ? theme.fonts.semiBold : theme.fonts.medium,
            fontSize: theme.fontSize.xs,
            color: active ? brand.primaryDark : brand.textSecondary,
          },
          chips: {
            ...theme.textStyles.controlM,
            color: active ? brand.primaryDark : brand.textSecondary,
          },
        },
      },
    }),
  };
});

// The indicator's position and width are plain props, so a re-render always reapplies them; shared
// values left the bar invisible after the screen was left and returned to.
const INDICATOR_TRANSITION = LinearTransition.duration(220).easing(Easing.out(Easing.cubic));

const tabsContentEntering = FadeIn.duration(220).easing(Easing.out(Easing.cubic));

type TabsProps<K extends string> = {
  items: TabItem<K>[];
  value: K;
  onChange: (key: K) => void;
  variant?: TabsVariant;
  tone?: TabsTone;
};

export function Tabs<K extends string>({
  items,
  value,
  onChange,
  variant = "segmented",
  tone = "primary",
}: TabsProps<K>) {
  tabsVariants.useVariants({ variant });

  const [layouts, setLayouts] = useState<Record<string, TabLayout>>({});

  const handleLayout = (key: string) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setLayouts((current) =>
      current[key]?.x === x && current[key]?.width === width
        ? current
        : { ...current, [key]: { x, width } }
    );
  };

  const activeLayout = layouts[value];

  return (
    <View style={tabsVariants.container}>
      {!!activeLayout && (
        <Animated.View
          testID="tabs-indicator"
          layout={INDICATOR_TRANSITION}
          style={[
            tabsVariants.indicator(tone),
            { left: activeLayout.x, width: activeLayout.width },
          ]}
        />
      )}
      {items.map((item) => {
        const active = item.key === value;

        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(item.key)}
            onLayout={handleLayout(item.key)}
            style={tabsVariants.tab(active)}
          >
            <Text
              variant={variant === "segmented" ? (active ? "bodySemiBold" : "bodyS") : undefined}
              style={tabsVariants.text(active, tone)}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export { tabsContentEntering, tabsVariants };
