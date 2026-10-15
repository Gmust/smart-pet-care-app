import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { AppleMaps, type Coordinates, GoogleMaps } from "expo-maps";

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
  // expo-maps renders Google Maps on Android and Apple Maps on iOS (no API key).
  // Apple Maps needs iOS 17: below it the native view renders nothing and raises
  // no error, so gate on the version. A binary without the native view throws on
  // render instead, which MapErrorBoundary turns into the fallback.
  const isGoogle = Platform.OS === "android" && GoogleMaps?.View != null;
  const isApple =
    Platform.OS === "ios" &&
    AppleMaps?.View != null &&
    Number.parseInt(String(Platform.Version), 10) >= 17;

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    setLastCamera({ latitude, longitude });
  }, [latitude, longitude]);

  // Apple Maps has no load event and no key to misconfigure, so only Google
  // Maps can time out.
  useEffect(() => {
    if (isLoaded || !isGoogle) return;
    const timer = setTimeout(() => setHasTimedOut(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isLoaded, isGoogle, attempt]);

  const fallback = (
    <View style={[styles.fallback, style]}>
      <Text variant="bodyS" style={styles.fallbackText}>
        {t("activity:map.unavailable")}
      </Text>
    </View>
  );

  if (!isGoogle && !isApple) {
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

  const mapMarkers = markers.map((marker) => ({
    id: marker.id,
    title: marker.title,
    coordinates: {
      latitude: marker.coordinates.latitude,
      longitude: marker.coordinates.longitude,
    },
  }));

  const handleMapClick = (event: { coordinates: Coordinates }) => {
    const { latitude, longitude } = event.coordinates;
    if (latitude == null || longitude == null) return;
    onMapClick?.({ latitude, longitude });
  };

  const handleMarkerClick = (marker: { id?: string }) => {
    if (marker.id) onMarkerClick?.(marker.id);
  };

  return (
    <MapErrorBoundary fallback={fallback}>
      <View style={[styles.container, style]}>
        {isApple ? (
          <AppleMaps.View
            key={attempt}
            style={styles.map}
            {...cameraProps}
            markers={mapMarkers}
            // Apple Maps does not report taps on POI labels, so a picker hides
            // them and every tap reaches onMapClick. Spread, not `undefined`:
            // the native view converts whatever it receives.
            {...(onMapClick ? { properties: { pointsOfInterest: { including: [] } } } : {})}
            onMapClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
          />
        ) : (
          <GoogleMaps.View
            key={attempt}
            style={styles.map}
            {...cameraProps}
            markers={mapMarkers}
            onMapLoaded={() => setIsLoaded(true)}
            onMapClick={handleMapClick}
            // A tap landing on a POI label never reaches onMapClick, which makes
            // picking a park or a vet look broken. Treat it as a map tap.
            onPOIClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
          />
        )}
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
