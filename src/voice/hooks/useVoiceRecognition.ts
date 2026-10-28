import { useRef, useState } from "react";
import { Platform } from "react-native";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";

import type { VoiceFailure } from "../types";

type Options = {
  /** Words the recognizer should expect, such as pet names it would otherwise misspell. */
  contextualStrings: string[];
  onTranscript: (transcript: string) => void;
  onFailure: (failure: Exclude<VoiceFailure, "unrecognized">) => void;
};

/**
 * One utterance per `start()`: the recognizer stops by itself after a pause and the last
 * transcript is handed to `onTranscript`. A session that errors or is aborted reports nothing.
 */
export const useVoiceRecognition = ({ contextualStrings, onTranscript, onFailure }: Options) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  // Events arrive outside React's render cycle; refs keep "end" from reading a stale transcript.
  const transcriptRef = useRef("");
  const isSettledRef = useRef(false);

  useSpeechRecognitionEvent("start", () => setIsListening(true));

  useSpeechRecognitionEvent("result", (event) => {
    const text = event.results[0]?.transcript ?? "";
    transcriptRef.current = text;
    setTranscript(text);
  });

  useSpeechRecognitionEvent("error", (event) => {
    isSettledRef.current = true;
    if (event.error === "aborted") return;
    if (event.error === "not-allowed") {
      onFailure("notAllowed");
      return;
    }
    if (event.error === "no-speech" || event.error === "speech-timeout") {
      onFailure("noSpeech");
      return;
    }
    onFailure("unavailable");
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    if (isSettledRef.current) return;
    isSettledRef.current = true;

    const text = transcriptRef.current.trim();
    if (!text) {
      onFailure("noSpeech");
      return;
    }
    onTranscript(text);
  });

  const start = async () => {
    transcriptRef.current = "";
    isSettledRef.current = false;
    setTranscript("");

    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      isSettledRef.current = true;
      onFailure("notAllowed");
      return;
    }
    if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
      isSettledRef.current = true;
      onFailure("unavailable");
      return;
    }

    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      continuous: false,
      maxAlternatives: 1,
      contextualStrings,
      // iOS keeps audio on the device when it can. Android's offline model has to be downloaded
      // per language first, and requiring it before then fails the session outright.
      requiresOnDeviceRecognition:
        Platform.OS === "ios" && ExpoSpeechRecognitionModule.supportsOnDeviceRecognition(),
    });
  };

  const stop = () => ExpoSpeechRecognitionModule.stop();

  const abort = () => {
    isSettledRef.current = true;
    ExpoSpeechRecognitionModule.abort();
  };

  return { isListening, transcript, start, stop, abort };
};
