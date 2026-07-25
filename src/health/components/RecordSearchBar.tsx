import { useTranslation } from "react-i18next";

import { Input } from "@/shadecn/ui/input";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function RecordSearchBar({ value, onChangeText, placeholder }: Props) {
  const { t } = useTranslation(["health"]);

  return (
    <Input
      placeholder={placeholder ?? t("health:recordList.searchPlaceholder")}
      value={value}
      onChangeText={onChangeText}
    />
  );
}
