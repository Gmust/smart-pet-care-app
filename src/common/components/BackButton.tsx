import { useTranslation } from "react-i18next";

import { Chevron } from "@/icons/arrows";
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
      <Chevron width={9} height={16} color={palette.brand.textBody} />
    </Button>
  );
};
