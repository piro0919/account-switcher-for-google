import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";
import { ACCOUNTS_SELECTOR, AVATAR_SELECTOR, expand, isFromTopPage } from "../src/switcher";

const setup = (html: string) => {
  const window = new Window({ url: "https://www.google.com/" });

  window.document.body.innerHTML = html;

  return window.document as unknown as Document;
};

const AVATAR =
  '<a href="https://accounts.google.com/SignOutOptions?hl=ja" role="button" aria-expanded="false">me</a>';

describe("expand", () => {
  it("clicks the avatar and stops once Google marks it expanded", async () => {
    const doc = setup(AVATAR);
    const button = doc.querySelector("a") as HTMLAnchorElement;
    let clicks = 0;

    button.addEventListener("click", () => {
      clicks += 1;
      button.setAttribute("aria-expanded", "true");
    });

    expect(await expand(doc, AVATAR_SELECTOR, { interval: 1 })).toBe(true);
    expect(clicks).toBe(1);
  });

  it("keeps clicking until Google's handler is attached", async () => {
    const doc = setup(AVATAR);
    const button = doc.querySelector("a") as HTMLAnchorElement;
    let clicks = 0;

    button.addEventListener("click", () => {
      clicks += 1;

      if (clicks === 3) button.setAttribute("aria-expanded", "true");
    });

    expect(await expand(doc, AVATAR_SELECTOR, { interval: 1 })).toBe(true);
    expect(clicks).toBe(3);
  });

  it("cancels the link navigation", async () => {
    const doc = setup(AVATAR);
    const button = doc.querySelector("a") as HTMLAnchorElement;
    const prevented: boolean[] = [];

    doc.addEventListener("click", (event) => prevented.push(event.defaultPrevented));

    await expand(doc, AVATAR_SELECTOR, { attempts: 1, interval: 1 });

    expect(prevented).toEqual([true]);
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("gives up when signed out", async () => {
    const doc = setup('<a href="https://accounts.google.com/ServiceLogin">ログイン</a>');

    expect(await expand(doc, AVATAR_SELECTOR, { attempts: 3, interval: 1 })).toBe(false);
  });

  it("opens the account list inside the popup", async () => {
    const doc = setup('<button aria-label="閉じる"></button><span aria-expanded="false">me</span>');
    const card = doc.querySelector("span") as HTMLElement;

    card.addEventListener("click", () => card.setAttribute("aria-expanded", "true"));

    expect(await expand(doc, ACCOUNTS_SELECTOR, { interval: 1 })).toBe(true);
  });
});

describe("isFromTopPage", () => {
  it.each([
    ["https://www.google.com/", true],
    ["https://www.google.co.jp/", true],
    ["https://www.google.com/search?q=a", false],
    ["https://mail.google.com/mail/u/0/", false],
    ["", false],
  ])("%s → %s", (referrer, expected) => {
    expect(isFromTopPage(referrer)).toBe(expected);
  });
});
