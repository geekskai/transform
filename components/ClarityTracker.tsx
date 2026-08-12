"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";
import { useRouter } from "next/router";
import { setProductAnalyticsContext } from "../lib/product-analytics";
import { readAnalyticsStorageConsent } from "../lib/privacy-preferences";

declare global {
  interface Window {
    __clarityInitialized?: boolean;
  }
}

const clarityProjectId =
  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "wa2k5yaq57";

export default function ClarityTracker() {
  const router = useRouter();

  useEffect(() => {
    if (!clarityProjectId || window.__clarityInitialized) {
      return;
    }

    Clarity.init(clarityProjectId);
    Clarity.consentV2({
      ad_Storage: "denied",
      analytics_Storage: readAnalyticsStorageConsent() || "denied"
    });
    window.__clarityInitialized = true;
  }, []);

  useEffect(() => {
    setProductAnalyticsContext(router.asPath || router.pathname || "/");
  }, [router.asPath, router.pathname]);

  return null;
}
