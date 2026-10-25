import { useTranslation } from "react-i18next";

import { Button } from "@/shadecn/ui/button";
import { useDrawerClose } from "@/shadecn/ui/drawer";

type Props = {
  pendingFrom: string | null;
  pendingTo: string | null;
  onApply: (from: string | null, to: string | null) => void;
  onClearPending: () => void;
};

// A separate component (not inlined in DateFilterDrawer) so useDrawerClose()
// resolves — it needs to be rendered inside DrawerContent's own children
// tree, not in the parent that renders <DrawerContent> itself.
export function DateFilterDrawerFooter({ pendingFrom, pendingTo, onApply, onClearPending }: Props) {
  const { t } = useTranslation(["health"]);
  const close = useDrawerClose();

  return (
    <>
      <Button
        variant="primary"
        onPress={() => {
          onApply(pendingFrom, pendingTo);
          close();
        }}
      >
        {t("health:recordList.filters.apply")}
      </Button>
      <Button
        variant="text"
        size="sm"
        onPress={() => {
          onClearPending();
          onApply(null, null);
          close();
        }}
      >
        {t("health:recordList.filters.clear")}
      </Button>
    </>
  );
}
