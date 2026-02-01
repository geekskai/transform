import { useEffect } from "react";
import HeaderNav from "@components/HeaderNav";
import ToolPageLayout from "@components/ToolPageLayout";
import "@styles/main.css";

import NProgress from "nprogress";
import { useRouter } from "next/router";
import { getToolMeta, SITE_CONFIG } from "../lib/seo";
import { Meta } from "@components/Meta";
import { JsonLd } from "@components/JsonLd";

export default function App(props) {
  const router = useRouter();

  useEffect(() => {
    let timer;

    const stopProgress = () => {
      clearTimeout(timer);
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
      timer && clearTimeout(timer);
    };
  }, []);

  const { Component, pageProps } = props;

  const toolMeta = getToolMeta(router.pathname || "/");

  return (
    <>
      {toolMeta ? (
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
          description="A polyglot web converter that's going to save you a lot of time."
          canonical={`${SITE_CONFIG.baseUrl.replace(/\/$/, "")}/`}
        />
      )}
      <JsonLd pathname={router.pathname || "/"} />
      <div className="app-root light">
        <header className="app-header" role="banner">
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
      </div>
    </>
  );
}
