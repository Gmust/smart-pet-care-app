import { useState } from "react";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

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

  const handleSelect = (selectedDate: Date) => {
    setIsOpen(false);
    onChange(selectedDate);
    onBlur?.();
  };

  const handleDismiss = () => {
    setIsOpen(false);
    onBlur?.();
  };

  return (
    <View>
      <Pressable onPress={() => !disabled && setIsOpen(true)}>
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
          onValueChange={(_event, selectedDate) => handleSelect(selectedDate)}
          onDismiss={handleDismiss}
        />
      ) : null}
    </View>
  );
}
