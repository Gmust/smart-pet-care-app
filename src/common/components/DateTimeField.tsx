import { useState } from "react";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Keyboard, Platform, Pressable, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

import { useDrawerNativeActivity } from "@/shadecn/ui/drawer";
import { Input } from "@/shadecn/ui/input";

type DateTimeMode = "date" | "time";

type DateTimeFieldProps = {
  value: Date | null;
  onChange: (date: Date) => void;
  /** Formats the selected value for display inside the input. */
  display: (date: Date) => string;
  mode?: DateTimeMode;
  label?: ReactNode;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  is24Hour?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  onBlur?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

export function DateTimeField({
  value,
  onChange,
  display,
  mode = "date",
  label,
  placeholder,
  error = false,
  disabled = false,
  is24Hour = true,
  minimumDate,
  maximumDate,
  onBlur,
  containerStyle,
}: DateTimeFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const beginNativeActivity = useDrawerNativeActivity();

  const open = () => {
    if (disabled) return;

    if (Platform.OS === "android") {
      Keyboard.dismiss();
      // The dialog's focus steal collapses an enclosing drawer; mark it as a
      // native activity so the drawer swallows that dismiss and re-presents.
      const endNativeActivity = beginNativeActivity?.();
      DateTimePickerAndroid.open({
        mode,
        value: value ?? new Date(),
        is24Hour,
        minimumDate,
        maximumDate,
        onValueChange: (event, selectedDate) => {
          if (selectedDate) onChange(selectedDate);
          onBlur?.();
          endNativeActivity?.();
        },
      });
      return;
    }

    // iOS renders the picker inline within the sheet — no suspend needed.
    setIsOpen(true);
  };

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={typeof label === "string" ? label : placeholder}
        onPress={open}
        disabled={disabled}
      >
        <View pointerEvents="none">
          <Input
            label={label}
            placeholder={placeholder}
            value={value ? display(value) : ""}
            editable={false}
            error={error}
            containerStyle={containerStyle}
          />
        </View>
      </Pressable>

      {isOpen ? (
        <DateTimePicker
          mode={mode}
          value={value ?? new Date()}
          is24Hour={is24Hour}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onValueChange={(event, selectedDate) => {
            setIsOpen(false);
            if (selectedDate) onChange(selectedDate);
            onBlur?.();
          }}
        />
      ) : null}
    </View>
  );
}
