import { getCurrentLanguage } from '@/contexts/LanguageContext';

export function useTranslation() {
  const { translate } = getCurrentLanguage();
  return t;
}