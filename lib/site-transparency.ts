export const PRIVACY_CONTACT_EMAIL = "geeks.kai@gmail.com";

export const PRIVACY_LAST_UPDATED = "July 25, 2026";
export const PRIVACY_LAST_MODIFIED = "2026-07-25";

export const PRIVACY_META = {
  title: "Privacy Policy | Folioify",
  description:
    "How Folioify handles tool input, server-backed transformations, browser storage, analytics, session replay, cookies, and advertising.",
  canonical: "https://folioify.com/privacy"
} as const;

export const PRIVACY_DISCLOSURES = {
  userContent:
    "Folioify processes code, markup, and data that you enter so the selected tool can return a result. Some transformations run in your browser, while server-backed transformations send the input to Folioify for processing. Do not enter secrets, credentials, personal data, or proprietary source code.",
  serverProcessing:
    "Server-backed transformations use the submitted input to perform the requested conversion and return the result. Folioify does not provide accounts or cloud storage for tool input. Depending on the transformer, input may exist temporarily in process memory or a temporary file that is deleted after the request. Hosting and operational logs may receive request metadata and error details derived from submitted input.",
  browserStorage:
    "Folioify may use local storage or session storage in your browser to remember tool settings, theme preferences, or recent editor state. You can clear this data through your browser settings.",
  analytics:
    "Folioify uses Microsoft Clarity for usage analytics and session replay. This service may receive device, browser, network, and interaction data. Editor and input content is intended to be masked in replay data, but you should not submit sensitive content.",
  cookies:
    "Folioify and its analytics or advertising providers may use cookies and similar technologies to operate the site, understand usage, prevent abuse, and support advertising. Browser controls can be used to block or delete cookies.",
  advertising:
    "Folioify may use Google AdSense to display advertising. When ads are enabled, Google and its partners may place or read cookies, use web beacons or IP addresses, and process visit information to serve, measure, and personalize ads where permitted.",
  vendors:
    "Third-party services currently used by Folioify include Microsoft Clarity, Vercel for hosting and server-backed transformations, and Google AdSense when advertising is enabled. Each provider processes data under its own terms and privacy policy.",
  owner: `Folioify is operated by GeeksKai. Privacy questions or requests can be sent to ${PRIVACY_CONTACT_EMAIL}.`
} as const;
