import { type ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Image } from "expo-image";
import * as ExpoImagePicker from "expo-image-picker";

import { Button } from "@/shadecn/ui/button";
import { useDrawerSetOpen } from "@/shadecn/ui/drawer";
import { Text } from "@/shadecn/ui/text";

export type ImagePickerValue = {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
  width?: number;
  height?: number;
};

type ImagePickerProps = {
  value: ImagePickerValue | null;
  onChange: (value: ImagePickerValue | null) => void;
  onBlur?: () => void;
  /** Fires before the picker opens, and before Android closes the enclosing drawer. */
  onPickStart?: () => void;
  accessibilityLabel?: string;
  label?: ReactNode;
  placeholder?: ReactNode;
  error?: boolean;
  disabled?: boolean;
  shape?: "circle" | "square";
  aspect?: [number, number];
  allowsEditing?: boolean;
  quality?: number;
};

export function ImagePicker({
  value,
  onChange,
  onBlur,
  onPickStart,
  accessibilityLabel,
  label,
  placeholder,
  error = false,
  disabled = false,
  shape = "circle",
  aspect = [1, 1],
  allowsEditing = true,
  quality = 0.8,
}: ImagePickerProps) {
  const { t } = useTranslation(["common"]);
  const setDrawerOpen = useDrawerSetOpen();

  const pick = useCallback(async () => {
    if (disabled) return;

    onPickStart?.();

    // The full-screen library + crop editor pause the Android Activity, which
    // dismisses the enclosing drawer's modal and can't be reliably kept open.
    // Instead close the drawer up front and reopen it when the picker returns —
    // the selected image lives in the parent form state, so it survives.
    const isAndroid = Platform.OS === "android";
    if (isAndroid) setDrawerOpen?.(false);

    try {
      const permission = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;

      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing,
        aspect,
        quality,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      onChange({
        uri: asset.uri,
        mimeType: asset.mimeType,
        fileName: asset.fileName,
        width: asset.width,
        height: asset.height,
      });
    } finally {
      onBlur?.();
      if (isAndroid) setDrawerOpen?.(true);
    }
  }, [allowsEditing, aspect, disabled, onBlur, onChange, onPickStart, quality, setDrawerOpen]);

  return (
    <View style={styles.wrapper}>
      {!!label && (
        <Text variant="bodyS" style={styles.label}>
          {label}
        </Text>
      )}

      <Pressable
        onPress={pick}
        disabled={disabled}
        style={[
          styles.box,
          shape === "square" && [styles.boxSquare, { aspectRatio: aspect[0] / aspect[1] }],
          !!error && styles.boxError,
          disabled && styles.boxDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {value ? (
          <Image source={{ uri: value.uri }} style={styles.preview} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            {typeof placeholder === "string" || !placeholder ? (
              <Text variant="body" style={styles.placeholderText}>
                {placeholder ?? t("imagePicker.title")}
              </Text>
            ) : (
              placeholder
            )}
          </View>
        )}
      </Pressable>

      {!!value && (
        <Button
          variant="dangerText"
          size="inline"
          style={styles.removeBtn}
          onPress={() => onChange(null)}
          disabled={disabled}
        >
          {t("imagePicker.remove")}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    gap: theme.spacing(1.5),
    alignItems: "center",
  },
  label: {
    alignSelf: "flex-start",
    color: theme.palette.brand.textSecondary,
  },
  box: {
    width: theme.spacing(28),
    height: theme.spacing(28),
    borderRadius: theme.borderRadius.full,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  boxSquare: {
    width: "100%",
    height: undefined,
    borderRadius: theme.borderRadius["2xl"],
  },
  boxError: {
    borderColor: theme.palette.brand.danger,
  },
  boxDisabled: {
    opacity: 0.5,
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: theme.palette.brand.textSecondary,
  },
  removeBtn: {
    marginTop: theme.spacing(4),
  },
}));
