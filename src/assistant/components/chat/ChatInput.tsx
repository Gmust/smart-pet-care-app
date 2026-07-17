import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useTranslation } from "react-i18next";
import { TextInput, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { useForm, useStore } from "@tanstack/react-form";

import { AiIcon } from "@/icons/ai-icon";
import { Button } from "@/shadecn/ui/button";
import { palette } from "@/styles/palette";

export type ChatInputHandle = {
  setDraft: (text: string) => void;
};

type Props = {
  inputDisabled?: boolean;
  submitDisabled?: boolean;
  petName: string;
  onSubmit: (message: string) => void;
};

export const ChatInput = forwardRef<ChatInputHandle, Props>(
  ({ inputDisabled = false, submitDisabled = false, petName, onSubmit }, ref) => {
    const { t } = useTranslation(["assistant"]);

    const inputRef = useRef<TextInput>(null);

    const form = useForm({
      defaultValues: { message: "" },
      onSubmit: ({ value }) => {
        const message = value.message.trim();
        if (!message || submitDisabled) return;
        onSubmit(message);
        form.reset();
      },
    });

    useImperativeHandle(ref, () => ({
      setDraft: (text: string) => {
        form.setFieldValue("message", text);
        inputRef.current?.focus();
      },
    }));

    const hasText = useStore(form.store, (state) => !!state.values.message.trim());
    const canSubmit = hasText && !submitDisabled;

    const shine = useSharedValue(0);

    const shineStyle = useAnimatedStyle(() => ({
      opacity: 0.35 + shine.value * 0.5,
      transform: [{ scale: 1 + shine.value * 0.35 }],
    }));

    useEffect(() => {
      if (canSubmit) {
        shine.value = withRepeat(
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );
      } else {
        cancelAnimation(shine);
        shine.value = withTiming(0, { duration: 150 });
      }
      return () => cancelAnimation(shine);
    }, [canSubmit, shine]);

    return (
      <form.Field name="message">
        {(field) => (
          <View style={styles.composerInput}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              placeholder={t("conversation.placeholder", { name: petName })}
              placeholderTextColor={styles.placeholder.color}
              accessibilityLabel={t("conversation.placeholder", { name: petName })}
              multiline
              maxLength={4000}
              editable={!inputDisabled}
              textAlignVertical="center"
            />
            <View style={styles.sendWrapper}>
              {canSubmit && (
                <Animated.View pointerEvents="none" style={[styles.shine, shineStyle]} />
              )}
              <Button
                size="icon"
                variant="icon"
                accessibilityLabel={t("conversation.send")}
                accessibilityHint={t("hints.send")}
                disabled={!canSubmit}
                onPress={() => void form.handleSubmit()}
                style={styles.sendButton(canSubmit)}
              >
                <AiIcon
                  width={18}
                  height={18}
                  color={canSubmit ? palette.white : palette.brand.primaryDefault}
                />
              </Button>
            </View>
          </View>
        )}
      </form.Field>
    );
  }
);

ChatInput.displayName = "ChatInput";

const styles = StyleSheet.create((theme) => ({
  composerInput: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["2xl"],
    paddingLeft: theme.spacing(3.5),
    paddingRight: theme.spacing(1.5),
    paddingVertical: theme.spacing(1.5),
    backgroundColor: theme.palette.white,
  },
  input: {
    flex: 1,
    minHeight: theme.spacing(11),
    maxHeight: theme.spacing(32),
    paddingVertical: theme.spacing(2.5),
    fontSize: theme.fontSize.base,
    lineHeight: theme.fontSize.base * 1.4,
    color: theme.palette.brand.textPrimary,
  },
  placeholder: { color: theme.palette.brand.textSecondary },
  sendWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  shine: {
    position: "absolute",
    width: theme.spacing(9),
    height: theme.spacing(9),
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.brand.primaryDefault,
  },
  sendButton: (canSubmit) => ({
    backgroundColor: canSubmit ? theme.palette.brand.primaryDefault : theme.palette.white,
  }),
}));
