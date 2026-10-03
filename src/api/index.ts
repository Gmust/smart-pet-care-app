import { api, noAuthApi } from "./axios";
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
  getApiPetsPetIdActivityLogs,
  postApiPetsPetIdActivityLogs,
  getApiPetsPetIdActivityLogsActivityLogId,
  patchApiPetsPetIdActivityLogsActivityLogId,
  deleteApiPetsPetIdActivityLogsActivityLogId,
  getApiPetsPetIdWellnessEvaluation,
  getApiPetsPetIdNotes,
  postApiPetsPetIdNotes,
  patchApiPetsPetIdNotesNoteId,
  deleteApiPetsPetIdNotesNoteId,
  getApiPetsPetIdHealthRecords,
  postApiPetsPetIdHealthRecords,
  getApiPetsPetIdHealthRecordsRecordId,
  patchApiPetsPetIdHealthRecordsRecordId,
  deleteApiPetsPetIdHealthRecordsRecordId,
  getApiProfileMe,
  getApiReminders,
  getApiRemindersId,
  getApiRemindersIdRuns,
  getApiRemindersPetPetId,
  getApiSessions,
  getApiSessionsSessionId,
  getApiSessionsSessionIdMessages,
  patchApiPetsId,
  patchApiRemindersId,
  patchApiUsers,
  getApiProfileAvatarUserId,
  postApiProfileAvatar,
  postApiAuthConfirmEmail,
  postApiAuthLogin,
  postApiAuthLogout,
  postApiAuthResendConfirmation,
  postApiAuthOauthGoogleMobile,
  postApiAuthRegister,
  postApiPets,
  postApiReminders,
  postApiRemindersIdComplete,
  postApiRemindersRunsRunIdAcknowledge,
  postApiSessions,
  postApiSessionsSessionIdMessages,
  postApiSessionsSessionIdMessagesMessageIdRetry,
  patchApiPetsIdPhoto,
  deleteApiNotificationsDeviceTokenToken,
  postApiNotificationsDeviceToken,
  getApiSymptoms,
  getApiSymptomsId,
} = getSmartPetCareAPI(api);

// Bypasses the auth interceptor: a 401 from the refresh call must end the
// session. Through the interceptor it would refresh the refresh, which then
// waits on its own in-flight promise and every request hangs.
export const { postApiAuthRefresh } = getSmartPetCareAPI(noAuthApi);
