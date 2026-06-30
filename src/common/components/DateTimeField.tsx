import { useState } from "react";
import type { ReactNode } from "react";
import { Platform, Pressable, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

import { useDrawerExternalActivity } from "@/shadecn/ui/drawer";
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
}: DateTimeFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const externalActivity = useDrawerExternalActivity();

  const open = async () => {
    if (disabled) return;

    if (Platform.OS === "android") {
      // Suspend the enclosing drawer (gorhom sheet) so the native picker
      // dialog doesn't fight it for window focus and remount/close the sheet.
      await externalActivity?.suspend();
      DateTimePickerAndroid.open({
        mode,
        value: value ?? new Date(),
        is24Hour,
        minimumDate,
        maximumDate,
        onChange: (event, selectedDate) => {
          if (event.type === "set" && selectedDate) onChange(selectedDate);
          onBlur?.();
          externalActivity?.resume();
        },
      });
      return;
    }

    // iOS renders the picker inline within the sheet — no suspend needed.
    setIsOpen(true);
  };

  return (
    <View>
      <Pressable onPress={open} disabled={disabled}>
        <View pointerEvents="none">
          <Input
            label={label}
            placeholder={placeholder}
            value={value ? display(value) : ""}
            editable={false}
            error={error}
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
