import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { GoogleMaps } from "expo-maps";

import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";

import type { ActivityCoordinates } from "../types";

import { MapErrorBoundary } from "./MapErrorBoundary";

export type ActivityMapMarker = {
  id: string;
  title: string;
  coordinates: ActivityCoordinates;
};

type Props = {
  markers: ActivityMapMarker[];
  /** Where the camera starts; falls back to the first marker when omitted. */
  center?: ActivityCoordinates | null;
  zoom?: number;
  onMapClick?: (coordinates: ActivityCoordinates) => void;
  onMarkerClick?: (id: string) => void;
  style?: React.ComponentProps<typeof View>["style"];
};

const DEFAULT_ZOOM = 14;

/**
 * A missing or invalid Maps API key renders a blank grey rectangle with no
 * error, so treat "never reported loaded" as unavailable and say so — otherwise
 * a config mistake looks like a broken screen.
 */
const LOAD_TIMEOUT_MS = 6000;

export const ActivityMap = ({
  markers,
  center,
  zoom = DEFAULT_ZOOM,
  onMapClick,
  onMarkerClick,
  style,
}: Props) => {
  const { t } = useTranslation(["activity"]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  // Bumping this remounts the native view and restarts the timer: a slow cold
  // start is not a permanent failure, and the fallback unmounts the view, so
  // onMapLoaded can never arrive on its own once we have given up.
  const [attempt, setAttempt] = useState(0);
  const [lastCamera, setLastCamera] = useState<ActivityCoordinates | null>(null);

  const latitude = center?.latitude ?? markers[0]?.coordinates.latitude;
  const longitude = center?.longitude ?? markers[0]?.coordinates.longitude;

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    setLastCamera({ latitude, longitude });
  }, [latitude, longitude]);

  useEffect(() => {
    if (isLoaded) return;
    const timer = setTimeout(() => setHasTimedOut(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isLoaded, attempt]);

  // expo-maps ships GoogleMaps.View on Android only; the development target is
  // Android, and other platforms get the same explicit fallback as a failed load.
  // GoogleMaps.View is also absent when the native binary predates the
  // dependency, so check for the component itself rather than assuming it.
  const isSupported = Platform.OS === "android" && GoogleMaps?.View != null;

  const fallback = (
    <View style={[styles.fallback, style]}>
      <Text variant="bodyS" style={styles.fallbackText}>
        {t("activity:map.unavailable")}
      </Text>
    </View>
  );

  if (!isSupported) {
    return fallback;
  }

  if (hasTimedOut) {
    return (
      <View style={[styles.fallback, style]}>
        <Text variant="bodyS" style={styles.fallbackText}>
          {t("activity:map.unavailable")}
        </Text>
        <Button
          size="sm"
          variant="secondary"
          onPress={() => {
            setHasTimedOut(false);
            setAttempt((current) => current + 1);
          }}
        >
          {t("activity:map.retry")}
        </Button>
      </View>
    );
  }

  // Once cameraPosition has been set it can never be taken away: removing the
  // prop hands the native view `undefined`, which fails to cast to a
  // CameraPositionRecord ("Could not cast dynamic value to ReadableMap").
  // Clearing a pin therefore leaves the camera where it was.
  const cameraCenter = latitude != null && longitude != null ? { latitude, longitude } : lastCamera;

  // Spread rather than pass `cameraPosition={undefined}`: the native view tries
  // to convert whatever arrives into a CameraPositionRecord, and undefined
  // throws "Could not cast dynamic value to ReadableMap" instead of being
  // treated as absent.
  const cameraProps = cameraCenter
    ? {
        cameraPosition: {
          coordinates: {
            latitude: cameraCenter.latitude,
            longitude: cameraCenter.longitude,
          },
          zoom,
        },
      }
    : {};

  return (
    <MapErrorBoundary fallback={fallback}>
      <View style={[styles.container, style]}>
        <GoogleMaps.View
          key={attempt}
          style={styles.map}
          {...cameraProps}
          markers={markers.map((marker) => ({
            id: marker.id,
            title: marker.title,
            coordinates: {
              latitude: marker.coordinates.latitude,
              longitude: marker.coordinates.longitude,
            },
          }))}
          onMapLoaded={() => setIsLoaded(true)}
          onMapClick={(event) => {
            const { latitude, longitude } = event.coordinates;
            if (latitude == null || longitude == null) return;
            onMapClick?.({ latitude, longitude });
          }}
          // A tap landing on a POI label never reaches onMapClick, which makes
          // picking a park or a vet look broken. Treat it as a map tap.
          onPOIClick={(event) => {
            const { latitude, longitude } = event.coordinates;
            if (latitude == null || longitude == null) return;
            onMapClick?.({ latitude, longitude });
          }}
          onMarkerClick={(marker) => {
            if (marker.id) onMarkerClick?.(marker.id);
          }}
        />
      </View>
    </MapErrorBoundary>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    overflow: "hidden",
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  map: {
    flex: 1,
  },
  fallback: {
    gap: theme.spacing(3),
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  fallbackText: {
    textAlign: "center",
    color: theme.palette.brand.textSecondary,
  },
}));
