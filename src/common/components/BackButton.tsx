import { useTranslation } from "react-i18next";

import { ChevronIcon } from "@/icons/chevron";
import { Button } from "@/shadecn/ui/button";
import { palette } from "@/styles/palette";

import { useRouter } from "expo-router";

type Props = {
  onBackPress?: () => void;
};

export const BackButton = ({ onBackPress }: Props) => {
  const { t } = useTranslation(["common"]);

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
      <ChevronIcon direction="left" width={18} height={18} color={palette.brand.primaryDark} />
    </Button>
  );
};
