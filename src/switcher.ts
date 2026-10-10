// The avatar at the top right is a link to SignOutOptions. Google's own click
// handler turns it into the account popup and sets aria-expanded.
export const AVATAR_SELECTOR = 'a[href^="https://accounts.google.com/SignOutOptions"]';

// Inside the popup (an ogs.google.com iframe), the current account card is the
// only element with aria-expanded; opening it lists the other accounts.
export const ACCOUNTS_SELECTOR = "[aria-expanded]";

export const POPUP_ORIGIN = "https://ogs.google.com";
export const TOP_ORIGINS = ["https://www.google.com", "https://www.google.co.jp"];

const EXPAND_REQUEST = "account-switcher-for-google:expand";
const EXPAND_ACK = "account-switcher-for-google:ack";

type Options = {
  attempts?: number;
  interval?: number;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Clicks the element until Google marks it aria-expanded="true".
 * Our listener cancels any link navigation, so a click that lands before
 * Google's handler is attached does nothing instead of leaving the page.
 */
export async function expand(
  doc: Document,
  selector: string,
  { attempts = 25, interval = 200 }: Options = {},
): Promise<boolean> {
  for (let i = 0; i < attempts; i += 1) {
    const target = doc.querySelector<HTMLElement>(selector);

    if (target?.getAttribute("aria-expanded") === "true") return true;

    if (target) {
      target.addEventListener("click", (event) => event.preventDefault(), {
        once: true,
      });
      target.click();
    }

    await sleep(interval);
  }

  return false;
}

/**
 * The popup iframe is shared by every Google service and only ever sees the
 * origin as its referrer, so it cannot tell the top page from search results.
 * The top-page script tells it instead, repeating until the iframe has loaded
 * and answers.
 */
export async function requestPopupExpand(
  win: Window,
  { attempts = 25, interval = 200 }: Options = {},
): Promise<boolean> {
  let acked = false;
  const onMessage = (event: MessageEvent) => {
    if (event.origin === POPUP_ORIGIN && event.data?.type === EXPAND_ACK) acked = true;
  };

  win.addEventListener("message", onMessage);

  try {
    for (let i = 0; i < attempts && !acked; i += 1) {
      // The popup frame starts as about:blank and is navigated later, so its
      // src says nothing. The target origin keeps other frames from receiving it.
      for (const frame of win.document.querySelectorAll("iframe")) {
        frame.contentWindow?.postMessage({ type: EXPAND_REQUEST }, POPUP_ORIGIN);
      }

      await sleep(interval);
    }
  } finally {
    win.removeEventListener("message", onMessage);
  }

  return acked;
}

/** Runs `onRequest` once, the first time the top page asks this popup to expand. */
export function listenForExpandRequest(win: Window, onRequest: () => void): void {
  const onMessage = (event: MessageEvent) => {
    if (!TOP_ORIGINS.includes(event.origin) || event.data?.type !== EXPAND_REQUEST) return;

    (event.source as Window | null)?.postMessage({ type: EXPAND_ACK }, event.origin);
    win.removeEventListener("message", onMessage);
    onRequest();
  };

  win.addEventListener("message", onMessage);
}
