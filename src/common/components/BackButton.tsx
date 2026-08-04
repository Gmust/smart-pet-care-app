import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";
import { useRouter } from "expo-router";

import { ChevronIcon } from "@/icons/chevron";
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
      <ChevronIcon
        direction="left"
        width={theme.iconSize.lg}
        height={theme.iconSize.lg}
        color={palette.brand.primaryDark}
      />
    </Button>
  );
};
