// The avatar at the top right is a link to SignOutOptions. Google's own click
// handler turns it into the account popup and sets aria-expanded.
export const AVATAR_SELECTOR = 'a[href^="https://accounts.google.com/SignOutOptions"]';

// Inside the popup (an ogs.google.com iframe), the current account card is the
// only element with aria-expanded; opening it lists the other accounts.
export const ACCOUNTS_SELECTOR = "[aria-expanded]";

const TOP_PAGES = new Set(["www.google.com", "www.google.co.jp"]);

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

    if (target?.getAttribute("aria-expanded") === "true") return true;
  }

  return false;
}

/** The popup is also used by Gmail, Drive and so on; only touch the one on the top page. */
export function isFromTopPage(referrer: string): boolean {
  try {
    const url = new URL(referrer);

    return TOP_PAGES.has(url.hostname) && url.pathname === "/";
  } catch {
    return false;
  }
}
