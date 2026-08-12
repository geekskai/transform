export const ANALYTICS_CONSENT_STORAGE_KEY =
  "folioify:analytics-storage-consent";
export const OPEN_PRIVACY_PREFERENCES_EVENT =
  "folioify:open-privacy-preferences";

export type AnalyticsStorageConsent = "granted" | "denied";

export function readAnalyticsStorageConsent(): AnalyticsStorageConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    return stored === "granted" || stored === "denied" ? stored : null;
  } catch {
    return null;
  }
}

export function saveAnalyticsStorageConsent(
  consent: AnalyticsStorageConsent
): void {
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);
  } catch {
    // The consent signal still applies to this page when storage is blocked.
  }
}
