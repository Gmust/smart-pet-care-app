import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { useQueryClient } from "@tanstack/react-query";

import { useRefreshControl } from "@/common/hooks/useRefreshControl";
import { getApiErrorMessage } from "@/errors/utils/getApiErrorMessage";

import { wellnessQueryKeys } from "../queries/wellnessQueryKeys";

// A pull is a plain refetch (the server keeps the stored score for 3 days). A failed refetch is
// told to the user, since nothing else on the screen would show it.
export const useWellnessRefresh = (petId: string | undefined) => {
  const { t } = useTranslation(["wellness"]);
  const queryClient = useQueryClient();

  return useRefreshControl(async () => {
    const queryKey = wellnessQueryKeys.evaluation(petId ?? "");
    await queryClient.refetchQueries({ queryKey, type: "active" });

    const state = queryClient.getQueryState(queryKey);
    if (state?.status === "error") {
      Toast.show({
        type: "error",
        text1: t("wellness:error.title"),
        text2: getApiErrorMessage(state.error),
      });
    }
  });
};
