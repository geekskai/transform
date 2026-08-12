import Clarity from "@microsoft/clarity";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  AnalyticsStorageConsent,
  OPEN_PRIVACY_PREFERENCES_EVENT,
  readAnalyticsStorageConsent,
  saveAnalyticsStorageConsent
} from "../lib/privacy-preferences";

export default function PrivacyPreferences() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(readAnalyticsStorageConsent() === null);
    const open = () => setIsOpen(true);
    window.addEventListener(OPEN_PRIVACY_PREFERENCES_EVENT, open);
    return () =>
      window.removeEventListener(OPEN_PRIVACY_PREFERENCES_EVENT, open);
  }, []);

  const choose = (analytics_Storage: AnalyticsStorageConsent) => {
    saveAnalyticsStorageConsent(analytics_Storage);
    if (window.__clarityInitialized) {
      Clarity.consentV2({ ad_Storage: "denied", analytics_Storage });
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Analytics privacy choices"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl sm:p-5"
    >
      <h2 className="text-base font-bold text-gray-900">Analytics privacy</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        Folioify uses Microsoft Clarity to understand whether tools work. Editor
        content is masked. You can allow analytics cookies to connect visits or
        continue with limited, cookieless analytics. Advertising storage stays
        disabled. Read the{" "}
        <Link
          href="/privacy"
          className="font-semibold text-brand-700 underline"
        >
          privacy policy
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={() => choose("denied")}>
          Continue without analytics cookies
        </Button>
        <Button onClick={() => choose("granted")}>
          Allow analytics cookies
        </Button>
      </div>
    </aside>
  );
}
