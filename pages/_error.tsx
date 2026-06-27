import NextErrorComponent, { type ErrorProps } from "next/error";
import type { NextPageContext } from "next";
import * as Sentry from "@sentry/nextjs";

function Error({ statusCode }: ErrorProps) {
  return <NextErrorComponent statusCode={statusCode} />;
}

Error.getInitialProps = async (contextData: NextPageContext) => {
  await Sentry.captureUnderscoreErrorException(contextData);

  return NextErrorComponent.getInitialProps(contextData);
};

export default Error;
