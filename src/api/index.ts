import { api } from "./axios";
import { getSmartPetCareAPI } from "./generated";

export { api, noAuthApi } from "./axios";
export * from "./generated";

export const {
  deleteApiPetsId,
  deleteApiRemindersId,
  deleteApiUsersId,
  getApiAuthOauthGoogle,
  getApiAuthOauthGoogleCallback,
  getApiPets,
  getApiPetsId,
  getApiProfileMe,
  getApiReminders,
  getApiRemindersId,
  getApiRemindersIdRuns,
  getApiRemindersPetPetId,
  patchApiPetsId,
  patchApiRemindersId,
  patchApiUsers,
  getApiProfileAvatarUserId,
  postApiProfileAvatar,
  postApiAuthLogin,
  postApiAuthLogout,
  postApiAuthOauthGoogleMobile,
  postApiAuthRefresh,
  postApiAuthRegister,
  postApiPets,
  postApiReminders,
  postApiRemindersRunsRunIdAcknowledge,
  patchApiPetsIdPhoto,
  deleteApiNotificationsDeviceTokenToken,
  postApiNotificationsDeviceToken,
} = getSmartPetCareAPI(api);
