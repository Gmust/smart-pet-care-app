import { type ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useDrawerExternalActivity } from "@/shadecn/ui/drawer";
import { Text } from "@/shadecn/ui/text";

import { Image } from "expo-image";
import * as ExpoImagePicker from "expo-image-picker";

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
  const drawerExternalActivity = useDrawerExternalActivity();

  const pick = useCallback(async () => {
    if (disabled) return;

    const permission = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      onBlur?.();
      return;
    }

    // Tear down the sheet before Android leaves the host Activity. Rebuilding a
    // BottomSheetModal after returning can orphan its previous portal instance.
    await drawerExternalActivity?.suspend();

    try {
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
      drawerExternalActivity?.resume();
    }
  }, [allowsEditing, aspect, disabled, drawerExternalActivity, onBlur, onChange, quality]);

  return (
    <View style={styles.wrapper}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <Pressable
        onPress={pick}
        disabled={disabled}
        style={[
          styles.box,
          shape === "square" && styles.boxSquare,
          !!error && styles.boxError,
          disabled && styles.boxDisabled,
        ]}
        accessibilityRole="button"
      >
        {value ? (
          <Image source={{ uri: value.uri }} style={styles.preview} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            {typeof placeholder === "string" || !placeholder ? (
              <Text style={styles.placeholderText}>{placeholder ?? t("imagePicker.title")}</Text>
            ) : (
              placeholder
            )}
          </View>
        )}
      </Pressable>

      {!!value && (
        <Pressable
          style={styles.removeBtn}
          onPress={() => onChange(null)}
          disabled={disabled}
          hitSlop={8}
        >
          <Text style={styles.remove}>Remove</Text>
        </Pressable>
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
    fontSize: theme.fontSize.sm,
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
    aspectRatio: 16 / 9,
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
    fontSize: theme.fontSize.sm,
  },
  removeBtn: {
    marginTop: theme.spacing(4),
  },
  remove: {
    color: theme.palette.brand.danger,
    fontSize: theme.fontSize.sm,
  },
}));
