export const PRIVACY_CONTACT_EMAIL = "geeks.kai@gmail.com";

export const PRIVACY_LAST_UPDATED = "August 12, 2026";
export const PRIVACY_LAST_MODIFIED = "2026-08-12";

export const ABOUT_META = {
  title: "About Folioify | Ownership, Mission & Open Source Credits",
  description:
    "Learn who operates Folioify, how its developer tools are maintained, and how the project credits its transform.tools open-source upstream.",
  canonical: "https://folioify.com/about"
} as const;

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
    "Folioify uses Microsoft Clarity for usage analytics and session replay. This service may receive device, browser, network, and interaction data. Editor and input content is intended to be masked in replay data, but you should not submit sensitive content. Advertising storage is denied. Analytics storage is denied by default unless you explicitly allow analytics cookies; limited cookieless measurement may still occur when analytics storage is denied.",
  cookies:
    "Folioify asks whether Microsoft Clarity may use analytics cookies and saves that choice in browser storage. You can reopen Privacy settings in the footer or clear cookies and browser storage through your browser settings.",
  advertising:
    "Folioify has a Google AdSense publisher account identifier but does not currently load the AdSense advertising script on this site. Before advertising is enabled, Folioify will implement the consent controls required for the regions and ad modes it serves and update this policy where necessary.",
  vendors:
    "Third-party services currently used by Folioify include Microsoft Clarity for analytics and Vercel for hosting and server-backed transformations. Google AdSense is a prospective advertising provider but its ad script is not currently loaded on Folioify. Each provider processes data under its own terms and privacy policy.",
  owner: `Folioify is operated by GeeksKai. Privacy questions or requests can be sent to ${PRIVACY_CONTACT_EMAIL}.`
} as const;
