import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { KeyboardEvents } from "react-native-keyboard-controller";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { PetResponseDto } from "@/api/generated";
import { StepIndicator } from "@/common/components/StepIndicator";
import { ChevronIcon } from "@/icons/chevron";
import { CrossIcon } from "@/icons/cross";
import { useCreatePetDraft } from "@/pets/hooks/useCreatePetDraft";
import { createPetStepOneSchema } from "@/pets/schemas/create-pet.schema";
import { Button } from "@/shadecn/ui/button";
import {
  Drawer,
  DRAWER_FOOTER_SOFT_FADE_SPACING,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerKeyboardDismiss,
  DrawerScrollView,
  DrawerTitle,
} from "@/shadecn/ui/drawer";
import { Text } from "@/shadecn/ui/text";

import { CreatePetBasicsStep } from "./create-pet/CreatePetBasicsStep";
import { CreatePetHealthStep } from "./create-pet/CreatePetHealthStep";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onCreated?: (pet: PetResponseDto) => void;
};

const STEP_COUNT = 2;
const FADE_MS = 200;
const STEP_TWO_FIELDS = new Set(["allergies", "chronicConditions", "behavioralNotes"]);

export const CreatePetDrawer = ({ isOpen, setIsOpen, onCreated }: Props) => {
  const { t } = useTranslation(["pets"]);
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<1 | 2>(1);
  // True once the keyboard has fully opened, false as soon as it starts to close. The button
  // below stays in the footer until the keyboard covers it; only then does a copy appear at the
  // end of the fields, and it is gone before the footer is uncovered again.
  const [isKeyboardShown, setIsKeyboardShown] = useState(false);
  const [footerHeight, setFooterHeight] = useState(0);
  // Callers pass inline functions; keeping them in refs stops a re-render of the caller from
  // re-running the effects below, which would send the user from step 2 back to step 1.
  const onCreatedRef = useRef(onCreated);
  const setIsOpenRef = useRef(setIsOpen);
  const { form, registerOnCreated } = useCreatePetDraft();

  useEffect(() => {
    const show = KeyboardEvents.addListener("keyboardDidShow", () => setIsKeyboardShown(true));
    const hide = KeyboardEvents.addListener("keyboardWillHide", () => setIsKeyboardShown(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useLayoutEffect(() => {
    onCreatedRef.current = onCreated;
    setIsOpenRef.current = setIsOpen;
  });

  useEffect(() => {
    if (isOpen) setStep(1);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    // `onCreated` goes first: AssistantNewPetPage marks the pet as created there, and its
    // close handler reads that mark.
    return registerOnCreated((pet) => {
      onCreatedRef.current?.(pet);
      setIsOpenRef.current(false);
    });
  }, [isOpen, registerOnCreated]);

  const stepOneSchema = createPetStepOneSchema(t);

  const primaryAction = (
    <form.Subscribe
      selector={(state) => ({
        isSubmitting: state.isSubmitting,
        isStepOneValid: stepOneSchema.safeParse(state.values).success,
      })}
    >
      {({ isSubmitting, isStepOneValid }) => (
        <Button
          animateDisabled
          disabled={step === 1 && !isStepOneValid}
          isLoading={isSubmitting}
          onPress={
            step === 1
              ? () => setStep(2)
              : async () => {
                  await form.handleSubmit();
                  // List rows are named "allergies[0]", so compare the part before the bracket.
                  const hasStepOneError = Object.entries(form.state.fieldMeta).some(
                    ([name, meta]) =>
                      !STEP_TWO_FIELDS.has(name.split("[")[0]) && (meta?.errors.length ?? 0) > 0
                  );
                  if (hasStepOneError) setStep(1);
                }
          }
        >
          {step === 1 ? t("pets:createPetDrawer.next") : t("pets:createPetDrawer.submit")}
        </Button>
      )}
    </form.Subscribe>
  );

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent
        scrollable
        snapPoints={["94%"]}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
      >
        <DrawerKeyboardDismiss fill={false}>
          <DrawerHeader style={styles.chrome}>
            <View style={styles.header}>
              {step === 2 ? (
                <Button
                  variant="icon"
                  size="icon"
                  accessibilityLabel={t("pets:createPetDrawer.back")}
                  icon={
                    <ChevronIcon
                      direction="left"
                      width={theme.iconSize.lg}
                      height={theme.iconSize.lg}
                      color={theme.palette.brand.textPrimary}
                    />
                  }
                  onPress={() => setStep(1)}
                />
              ) : (
                <View style={[styles.headerSpacer, styles.headerButton]} />
              )}
              <View style={styles.titleBlock}>
                <DrawerTitle>
                  {step === 1
                    ? t("pets:createPetDrawer.title")
                    : t("pets:createPetDrawer.healthTitle")}
                </DrawerTitle>
                {step === 2 && (
                  <form.Subscribe selector={(state) => state.values.name.trim()}>
                    {(name) => (
                      <Text variant="bodyS" numberOfLines={1} style={styles.subtitle}>
                        {t("pets:createPetDrawer.forPet", { name })}
                      </Text>
                    )}
                  </form.Subscribe>
                )}
              </View>
              <Button
                variant="icon"
                size="icon"
                accessibilityLabel={t("pets:createPetDrawer.close")}
                icon={
                  <CrossIcon
                    width={theme.iconSize.md}
                    height={theme.iconSize.md}
                    color={theme.palette.brand.textPrimary}
                  />
                }
                onPress={() => setIsOpen(false)}
              />
            </View>
            <StepIndicator
              current={step}
              total={STEP_COUNT}
              label={t("pets:createPetDrawer.stepOfTotal", { current: step, total: STEP_COUNT })}
              showLabel={step === 1}
            />
          </DrawerHeader>
        </DrawerKeyboardDismiss>

        <DrawerScrollView
          // With the keyboard up the scroll reaches over the sheet's bottom inset, so it ends right
          // under the button.
          style={[
            styles.scroll,
            isKeyboardShown && { marginBottom: -(insets.bottom + theme.spacing(2)) },
          ]}
          // Without the keyboard the footer and its fade float over the end of the scroll; with it, the
          // button is the last thing in the scroll.
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: isKeyboardShown
                ? theme.spacing(4)
                : footerHeight + theme.spacing(DRAWER_FOOTER_SOFT_FADE_SPACING),
            },
          ]}
          bottomOffset={theme.spacing(10)}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View key={step} entering={FadeIn.duration(FADE_MS)}>
            {step === 1 ? <CreatePetBasicsStep form={form} /> : <CreatePetHealthStep form={form} />}
          </Animated.View>
          {isKeyboardShown && (
            <Animated.View entering={FadeIn.duration(FADE_MS)} style={styles.inlineAction}>
              {primaryAction}
            </Animated.View>
          )}
        </DrawerScrollView>

        <DrawerFooter
          softFade
          style={styles.footer}
          onLayout={(event) => setFooterHeight(event.nativeEvent.layout.height)}
        >
          {primaryAction}
          <form.Subscribe selector={(state) => !state.isDefaultValue}>
            {(hasDraft) => {
              const isShown = hasDraft && step === 1;
              return (
                <Button
                  variant="dangerText"
                  size="inline"
                  disabled={!isShown}
                  importantForAccessibility={isShown ? "auto" : "no-hide-descendants"}
                  style={[styles.clear, isShown ? styles.clearShown : styles.clearHidden]}
                  onPress={() => {
                    form.reset();
                    setStep(1);
                  }}
                >
                  {t("pets:createPetDrawer.clear")}
                </Button>
              );
            }}
          </form.Subscribe>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

const styles = StyleSheet.create((theme) => ({
  // The sheet pads its content by 24; the design asks for 16, hence the negative margins.
  chrome: {
    gap: theme.spacing(4),
    paddingHorizontal: 0,
    marginHorizontal: -theme.spacing(2),
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing(2),
  },
  headerButton: {
    marginTop: -theme.spacing(0.75),
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  subtitle: {
    textAlign: "center",
    color: theme.palette.brand.textSecondary,
  },
  headerSpacer: {
    width: theme.spacing(9),
  },
  scroll: {
    flex: 1,
    marginHorizontal: -theme.spacing(2),
    paddingTop: theme.spacing(4),
  },
  content: {
    flexGrow: 1,
  },
  inlineAction: {
    paddingTop: theme.spacing(6),
  },
  footer: {
    marginHorizontal: -theme.spacing(2),
    // The floating footer pads its bottom by 24; the design asks for 16.
    marginBottom: -theme.spacing(2),
    alignItems: "stretch",
    gap: theme.spacing(3),
  },
  clear: {
    alignSelf: "center",
    transitionProperty: "opacity",
    transitionDuration: `${FADE_MS}ms`,
  },
  clearShown: {
    opacity: 1,
  },
  clearHidden: {
    opacity: 0,
  },
}));
