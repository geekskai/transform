import React from "react";
import Document, { Head, Main, NextScript, Html } from "next/document";

interface DocumentProps {
  hydrationScript?: React.ReactChild;
}

export default class MyDocument extends Document<DocumentProps> {
  static async getInitialProps(ctx: any) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          <meta charSet="utf-8" />
          <meta
            name="google-site-verification"
            content="bjJSOEahdert-7mwVScrwTTUVR3nSe0bEj5YjevUNn0"
          />
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
