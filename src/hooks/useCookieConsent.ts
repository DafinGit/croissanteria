import { useState, useEffect } from 'react';

export interface CookiePreferences {
  essential: boolean;
  functional: boolean;
}

export const useCookieConsent = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: false
  });

  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('gdpr-cookie-consent');
    if (consent) {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
      setHasConsented(true);
    }
  }, []);

  const isAllowed = (cookieType: keyof CookiePreferences): boolean => {
    if (!hasConsented) return false;
    return preferences[cookieType];
  };

  const updatePreferences = (newPreferences: CookiePreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('gdpr-cookie-consent', JSON.stringify(newPreferences));
    localStorage.setItem('gdpr-consent-timestamp', new Date().toISOString());
    setHasConsented(true);
  };

  const resetConsent = () => {
    localStorage.removeItem('gdpr-cookie-consent');
    localStorage.removeItem('gdpr-consent-timestamp');
    setHasConsented(false);
    setPreferences({
      essential: true,
      functional: false
    });
  };

  return {
    preferences,
    hasConsented,
    isAllowed,
    updatePreferences,
    resetConsent
  };
};