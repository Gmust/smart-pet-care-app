import { lazy, Suspense } from "react";
import { requireOptionalNativeModule } from "expo";

// expo-speech-recognition and expo-speech look their native modules up the moment they are
// imported, and that throws in a binary built before they were added (Expo Go, an older dev
// client). Importing the button lazily, only once both modules are known to exist, turns that
// crash on Home into a missing mic button.
const VoiceCommandButton = lazy(() => import("./VoiceCommandButton"));

export const VoiceCommandEntry = () => {
  const isSupported =
    !!requireOptionalNativeModule("ExpoSpeechRecognition") &&
    !!requireOptionalNativeModule("ExpoSpeech");

  if (!isSupported) return null;

  return (
    <Suspense fallback={null}>
      <VoiceCommandButton />
    </Suspense>
  );
};
