import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { ActivityIcon } from "@/icons/activity";
import { HomeIcon } from "@/icons/home";
import type { Icon } from "@/icons/icons";
import { CatIcon } from "@/icons/pets";
import { UserIcon } from "@/icons/user";
import { palette } from "@/styles/palette";

const ACTIVE_COLOR = palette.brand.primaryDefault;
const INACTIVE_COLOR = palette.brand.textSecondary;

type TabMeta = {
  label: string;
  icon: Icon;
};

const TAB_META: Record<string, TabMeta> = {
  home: { label: "Home", icon: HomeIcon },
  pets: { label: "Pets", icon: CatIcon },
  activity: { label: "Activity", icon: ActivityIcon },
  profile: { label: "Profile", icon: UserIcon },
};

type TabBarRoute = {
  key: string;
  name: string;
};

type TabBarNavigation = {
  emit: (event: { type: "tabPress"; target?: string; canPreventDefault: true }) => {
    defaultPrevented: boolean;
  };
  navigate: (name: string) => void;
};

type TabBarProps = {
  state: {
    index: number;
    routes: TabBarRoute[];
  };
  navigation: TabBarNavigation;
};

export function TabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRouteName = state.routes[state.index]?.name;

  return (
    <View
      style={[styles.wrapper, { paddingBottom: insets.bottom || styles.wrapper.paddingHorizontal }]}
      pointerEvents="box-none"
    >
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name];
          if (!meta) {
            return null;
          }

          const isFocused =
            state.index === index || (route.name === "pets" && activeRouteName === "pet-profile");
          const shouldNavigateToTab =
            !isFocused || (route.name === "pets" && activeRouteName === "pet-profile");
          const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;
          const Glyph = meta.icon;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (shouldNavigateToTab && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.item}
              accessibilityRole="button"
              accessibilityLabel={meta.label}
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <Glyph width={24} height={24} color={color} />
              <Text style={[styles.label, isFocused && styles.labelActive, { color }]}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingHorizontal: theme.spacing(4),
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: theme.spacing(15),
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(2),
    borderRadius: theme.borderRadius["4xl"],
    backgroundColor: theme.palette.white,
    shadowColor: theme.palette.brand.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  item: {
    width: theme.spacing(18),
    height: theme.spacing(12),
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  label: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSize.xs,
    lineHeight: 10,
  },
  labelActive: {
    fontFamily: theme.fonts.semiBold,
  },
}));
