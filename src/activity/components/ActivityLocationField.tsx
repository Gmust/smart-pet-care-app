import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { StyleSheet } from "react-native-unistyles";
import * as Location from "expo-location";

import { Button } from "@/shadecn/ui/button";
import { Input } from "@/shadecn/ui/input";
import { Text } from "@/shadecn/ui/text";

import type { ActivityCoordinates } from "../types";

import { ActivityMap } from "./ActivityMap";

type Props = {
  label: string;
  onChangeLabel: (label: string) => void;
  coordinates: ActivityCoordinates | null;
  onChangeCoordinates: (coordinates: ActivityCoordinates | null) => void;
};

export const ActivityLocationField = ({
  label,
  onChangeLabel,
  coordinates,
  onChangeCoordinates,
}: Props) => {
  const { t } = useTranslation(["activity", "common"]);

  const [isLocating, setIsLocating] = useState(false);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  // Only seeds the camera. Without it a fresh entry opens on (0, 0) and the
  // user has to pan across the ocean to drop a pin.
  const [cameraSeed, setCameraSeed] = useState<ActivityCoordinates | null>(null);

  useEffect(() => {
    if (coordinates) return;
    let isActive = true;
    // getForegroundPermissionsAsync only reads the current grant — no prompt,
    // so opening the drawer still asks for nothing.
    Location.getForegroundPermissionsAsync()
      .then(({ status }) =>
        status === Location.PermissionStatus.GRANTED ? Location.getLastKnownPositionAsync() : null
      )
      .then((position) => {
        if (!isActive || !position) return;
        setCameraSeed({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      })
      .catch(() => {});
    return () => {
      isActive = false;
    };
  }, [coordinates]);

  // Permission is requested on intent, never on mount: location is optional and
  // a prompt for merely opening the drawer is not worth the goodwill.
  const useCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        setIsPermissionDenied(true);
        return;
      }
      setIsPermissionDenied(false);
      const position = await Location.getCurrentPositionAsync({});
      onChangeCoordinates({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (e) {
      console.error(e);
      Toast.show({ type: "error", text1: t("activity:location.currentFailed") });
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{t("activity:forms.activity.fields.location")}</Text>

      <Input
        placeholder={t("activity:forms.activity.placeholders.locationLabel")}
        value={label}
        onChangeText={onChangeLabel}
      />

      <ActivityMap
        style={styles.map}
        markers={
          coordinates
            ? [{ id: "pending", title: label || t("activity:location.selected"), coordinates }]
            : []
        }
        center={coordinates ?? cameraSeed}
        onMapClick={onChangeCoordinates}
      />

      {isPermissionDenied && (
        <Text variant="caption" style={styles.note}>
          {t("activity:location.permissionDenied")}
        </Text>
      )}

      <View style={styles.actions}>
        <Button
          size="md"
          variant="secondary"
          isLoading={isLocating}
          disabled={isLocating}
          onPress={useCurrentLocation}
        >
          {t("activity:location.useCurrent")}
        </Button>

        {!!coordinates && (
          <Button size="md" variant="danger" onPress={() => onChangeCoordinates(null)}>
            {t("activity:location.clear")}
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  field: {
    gap: theme.spacing(1.5),
  },
  label: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textSecondary,
  },
  map: {
    height: theme.spacing(45),
  },
  note: {
    color: theme.palette.brand.textSecondary,
  },
  actions: {
    gap: theme.spacing(2),
  },
}));
