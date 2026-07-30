import { initReactI18next } from "react-i18next";
import i18next from "i18next";

import enAssistant from "@/assistant/locales/en.json";
import enAuth from "@/auth/locales/en.json";
import enCommon from "@/common/locales/en.json";
import enHome from "@/home/locales/en.json";
import enPets from "@/pets/locales/en.json";
import enProfile from "@/profile/locales/en.json";
import enReminders from "@/reminders/locales/en.json";

export enum Languages {
  en = "en",
}

export const languages = ["en"] as const;
export type Lang = (typeof languages)[number];

const modules = ["common", "home", "auth", "reminders", "pets", "profile", "assistant"] as const;

export type I18nModule = (typeof modules)[number];

type TranslationJson = { [key: string]: string | TranslationJson | string[] };

const enResources = {
  common: enCommon,
  home: enHome,
  auth: enAuth,
  reminders: enReminders,
  pets: enPets,
  profile: enProfile,
  assistant: enAssistant,
} as const satisfies Record<I18nModule, TranslationJson>;

const resources: Record<Lang, Record<I18nModule, TranslationJson>> = {
  en: enResources,
};

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: typeof enResources;
  }
}

i18next.use(initReactI18next).init({
  resources,
  lng: Languages.en,
  fallbackLng: Languages.en,
  defaultNS: "common",
  fallbackNS: "common",
  ns: modules,
  interpolation: { escapeValue: false },
});

export default i18next;
