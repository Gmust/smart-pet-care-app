import { useEffect, useImperativeHandle, useRef, useState } from "react";
import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import type { TextInput } from "react-native";
import { Keyboard, Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { CalendarSearchIcon } from "@/icons/calendar";
import { CrossIcon } from "@/icons/cross";
import { SearchIcon } from "@/icons/search";
import { Button } from "@/shadecn/ui/button";
import { Input } from "@/shadecn/ui/input";

export type RecordSearchRowHandle = {
  blur: () => void;
  /**
   * Suppresses the next stray onFocus for a short window instead of letting
   * it visually activate and correcting afterward (which read as a flash of
   * highlight). Call right when a drawer closes — see HealthRecordListPage.
   */
  guardAgainstStrayFocus: () => void;
};

const STRAY_FOCUS_GUARD_MS = 600;

type Props = {
  ref?: RefObject<RecordSearchRowHandle | null>;
  value: string;
  onChangeText: (text: string) => void;
  onOpenDateFilter: () => void;
  isDateFilterActive: boolean;
};

export function RecordSearchRow({
  ref,
  value,
  onChangeText,
  onOpenDateFilter,
  isDateFilterActive,
}: Props) {
  const [focused, setFocused] = useState(false);
  // Blurring in onFocus still lets the native input render as focused for a
  // frame first (visible flash of the caret). Making it non-focusable for
  // the guard window instead means Android's focus-search shouldn't even
  // consider it a candidate, so the stray focus never lands in the first
  // place. onFocus still checks the ref as a fallback in case it does.
  const [strayFocusGuard, setStrayFocusGuard] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const strayFocusGuardRef = useRef(false);
  const strayFocusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useTranslation(["health"]);
  const { theme } = useUnistyles();

  useImperativeHandle(
    ref,
    () => ({
      blur: () => inputRef.current?.blur(),
      guardAgainstStrayFocus: () => {
        strayFocusGuardRef.current = true;
        setStrayFocusGuard(true);
        if (strayFocusTimeoutRef.current) clearTimeout(strayFocusTimeoutRef.current);
        strayFocusTimeoutRef.current = setTimeout(() => {
          strayFocusGuardRef.current = false;
          setStrayFocusGuard(false);
        }, STRAY_FOCUS_GUARD_MS);
      },
    }),
    []
  );

  useEffect(() => {
    // Dismissing the keyboard via the Android back button/gesture doesn't
    // reliably fire the TextInput's onBlur, so a plain `setFocused(false)`
    // here would desync from the native input (still focused — caret stays,
    // and the next tap wouldn't re-fire onFocus). Blurring the ref instead
    // keeps native focus and `focused` state in sync via the onBlur below.
    const subscription = Keyboard.addListener("keyboardDidHide", () => inputRef.current?.blur());
    return () => {
      subscription.remove();
      if (strayFocusTimeoutRef.current) clearTimeout(strayFocusTimeoutRef.current);
    };
  }, []);

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={styles.inputWrapper}
        hitSlop={{ top: 6, bottom: 6 }}
        onPress={() => {
          if (strayFocusGuardRef.current) {
            // A deliberate tap always wins over the guard — cancel it, but
            // `focusable` needs a tick to actually commit natively before
            // .focus() would work, so defer by a frame.
            strayFocusGuardRef.current = false;
            setStrayFocusGuard(false);
            if (strayFocusTimeoutRef.current) clearTimeout(strayFocusTimeoutRef.current);
            requestAnimationFrame(() => inputRef.current?.focus());
            return;
          }
          inputRef.current?.focus();
        }}
      >
        <Input
          ref={inputRef}
          focusable={!strayFocusGuard}
          containerStyle={[styles.inputContainer, focused && styles.inputContainerFocused]}
          inputStyle={styles.inputText}
          placeholder={t("health:recordList.searchPlaceholder")}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => {
            if (strayFocusGuardRef.current) {
              inputRef.current?.blur();
              return;
            }
            setFocused(true);
          }}
          onBlur={() => setFocused(false)}
          leftSlot={
            <SearchIcon
              width={theme.iconSize.md}
              height={theme.iconSize.md}
              color={theme.palette.brand.textSecondary}
            />
          }
          rightSlot={
            value.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("health:recordList.clearSearch")}
                hitSlop={8}
                onPress={() => onChangeText("")}
              >
                <CrossIcon
                  width={theme.iconSize.sm}
                  height={theme.iconSize.sm}
                  color={theme.palette.brand.textSecondary}
                />
              </Pressable>
            ) : null
          }
        />
      </Pressable>
      <Button
        variant="icon"
        size="icon"
        style={[styles.dateButton, isDateFilterActive && styles.dateButtonActive]}
        accessibilityLabel={t("health:recordList.filters.openFilter")}
        icon={
          <CalendarSearchIcon
            width={theme.iconSize.md}
            height={theme.iconSize.md}
            color={theme.palette.brand.textSecondary}
          />
        }
        onPress={onOpenDateFilter}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(1.5),
    paddingVertical: theme.spacing(1.5),
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  inputWrapper: {
    flex: 1,
    minWidth: 0,
  },
  inputContainer: {
    minHeight: undefined,
    borderWidth: 1,
    borderRadius: theme.borderRadius.xl,
    borderColor: theme.palette.brand.surfaceBorder,
    backgroundColor: theme.palette.brand.surfacePage,
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(2.5),
    gap: theme.spacing(2.5),
  },
  inputContainerFocused: {
    backgroundColor: theme.palette.white,
  },
  inputText: {
    ...theme.textStyles.bodyS,
    paddingVertical: 0,
    color: theme.palette.brand.textSecondary,
  },
  dateButton: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.palette.brand.surfacePage,
    borderColor: theme.palette.brand.surfaceBorder,
  },
  dateButtonActive: {
    backgroundColor: theme.palette.white,
  },
}));
