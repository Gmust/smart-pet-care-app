import { initReactI18next } from "react-i18next";

import ukCommon from "@/locales/common/uk.json";

import i18next from "i18next";

export enum Languages {
  uk = "uk",
}

export const languages = ["uk"] as const;
export type Lang = (typeof languages)[number];

const modules = ["common"] as const;

export type I18nModule = (typeof modules)[number];

type TranslationJson = { [key: string]: string | TranslationJson | string[] };

const ukResources = {
  common: ukCommon,
} as const satisfies Record<I18nModule, TranslationJson>;

const resources: Record<Lang, Record<I18nModule, TranslationJson>> = {
  uk: ukResources,
};

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: typeof ukResources;
  }
}

i18next.use(initReactI18next).init({
  resources,
  lng: Languages.uk,
  fallbackLng: Languages.uk,
  defaultNS: "common",
  fallbackNS: "common",
  ns: modules,
  interpolation: { escapeValue: false },
});

export default i18next;
