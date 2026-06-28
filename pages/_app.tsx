import { useEffect } from "react";
import HeaderNav from "@components/HeaderNav";
import SiteFooter from "@components/SiteFooter";
import ToolPageLayout from "@components/ToolPageLayout";
import "@styles/main.css";
import NProgress from "nprogress";
import { useRouter } from "next/router";
import { getToolMeta, SITE_CONFIG } from "../lib/seo";
import { Meta } from "@components/Meta";
import { JsonLd } from "@components/JsonLd";
import ClarityTracker from "@components/ClarityTracker";

export default function App(props) {
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    const stopProgress = () => {
      if (timer) clearTimeout(timer);
      NProgress.done();
    };

    const startProgress = () => NProgress.start();

    const showProgressBar = () => {
      timer = setTimeout(startProgress, 300);
      router.events.on("routeChangeComplete", stopProgress);
      router.events.on("routeChangeError", stopProgress);
    };

    router.events.on("routeChangeStart", showProgressBar);

    return () => {
      router.events.off("routeChangeComplete", stopProgress);
      router.events.off("routeChangeError", stopProgress);
      router.events.off("routeChangeStart", showProgressBar);
      if (timer) clearTimeout(timer);
    };
  }, [router.events]);

  const { Component, pageProps } = props;
  const currentPath =
    (router.asPath || router.pathname || "/").split(/[?#]/)[0] || "/";
  const toolMeta = getToolMeta(currentPath);
  const isNotFoundPage = router.pathname === "/404";

  return (
    <>
      {isNotFoundPage ? (
        <Meta
          title={`Page Not Found | ${SITE_CONFIG.name}`}
          description={`The page you requested could not be found. Browse ${SITE_CONFIG.name} developer tools or return to the homepage.`}
          noindex
        />
      ) : toolMeta ? (
        <Meta
          title={toolMeta.title}
          description={toolMeta.description}
          canonical={toolMeta.canonical}
          keywords={toolMeta.keywords}
          ogImage={toolMeta.ogImage}
          ogType={toolMeta.ogType}
          noindex={toolMeta.noindex}
          lastModified={toolMeta.lastModified}
          datePublished={toolMeta.datePublished}
        />
      ) : (
        <Meta
          title={SITE_CONFIG.name}
          description="The ultimate collection of free online developer tools. Convert, format, validate, and generate code locally in your browser."
          canonical={`${SITE_CONFIG.baseUrl.replace(/\/$/, "")}/`}
        />
      )}
      <JsonLd pathname={currentPath} />
      <ClarityTracker />

      <div className="app-root light">
        <header
          className="app-header w-full backdrop-blur-[20px]"
          role="banner"
        >
          <HeaderNav />
        </header>

        <main className="app-main" role="main">
          <div className="app-content">
            {router.pathname.startsWith("/tools/") ? (
              <ToolPageLayout>
                <Component {...pageProps} />
              </ToolPageLayout>
            ) : (
              <Component {...pageProps} />
            )}
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
