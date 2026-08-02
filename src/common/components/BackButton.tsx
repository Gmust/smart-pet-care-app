import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";
import { useRouter } from "expo-router";

import { Chevron } from "@/icons/arrows";
import { Button } from "@/shadecn/ui/button";
import { palette } from "@/styles/palette";

type Props = {
  onBackPress?: () => void;
};

export const BackButton = ({ onBackPress }: Props) => {
  const { t } = useTranslation(["common"]);
  const { theme } = useUnistyles();

  const router = useRouter();

  const handleBack = () => {
    if (!router.canGoBack()) return;
    router.back();
  };

  return (
    <Button
      size="icon"
      variant="icon"
      accessibilityLabel={t("actions.back")}
      onPress={onBackPress ?? handleBack}
    >
      <Chevron
        width={theme.iconSize.lg}
        height={theme.iconSize.lg}
        color={palette.brand.primaryDark}
      />
    </Button>
  );
};
