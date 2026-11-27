import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";

import { InfoIcon } from "@/icons/info";
import { Button } from "@/shadecn/ui/button";
import { Tooltip } from "@/shadecn/ui/tooltip";

type InfoHintProps = {
  text: string;
  accessibilityLabel: string;
};

export const InfoHint = ({ text, accessibilityLabel }: InfoHintProps) => {
  const { t } = useTranslation(["common"]);
  const { theme } = useUnistyles();

  return (
    <Tooltip
      dismissLabel={t("common:gotIt")}
      trigger={
        <Button
          variant="text"
          size="hug"
          accessibilityLabel={accessibilityLabel}
          hitSlop={(theme.minTouchTarget - theme.iconSize.md) / 2}
          icon={
            <InfoIcon
              width={theme.iconSize.md}
              height={theme.iconSize.md}
              color={theme.palette.brand.textSecondary}
            />
          }
        />
      }
    >
      {text}
    </Tooltip>
  );
};
