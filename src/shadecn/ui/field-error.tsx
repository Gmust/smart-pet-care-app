import type { StyleProp, TextStyle } from "react-native";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "./text";

// TanStack Form with a Standard Schema (Zod) validator stores the raw issue
// objects in `field.state.meta.errors`. Pull out their (deduped) messages so a
// field with a single error shows one line, and a field with several shows a
// bulleted list. Accepts `unknown[]` so it tolerates whatever the validator emits.
const uniqueMessages = (errors: ReadonlyArray<unknown>): string[] => {
  const messages = errors.flatMap((error) => {
    if (typeof error === "string") {
      return [error];
    }
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      return [error.message];
    }
    return [];
  });
  return [...new Set(messages)];
};

interface FieldErrorProps {
  errors?: ReadonlyArray<unknown>;
  style?: StyleProp<TextStyle>;
}

function FieldError({ errors, style }: FieldErrorProps) {
  const messages = uniqueMessages(errors ?? []);

  if (messages.length === 0) {
    return null;
  }

  const isList = messages.length > 1;

  return (
    <View role="alert" style={styles.container}>
      {messages.map((message) => (
        <Text key={message} style={[styles.text, style]}>
          {isList ? `• ${message}` : message}
        </Text>
      ))}
    </View>
  );
}

export { FieldError };

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing(0.5),
  },
  text: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.palette.brand.danger,
  },
}));
