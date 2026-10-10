import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";
import {
  ACCOUNTS_SELECTOR,
  AVATAR_SELECTOR,
  expand,
  listenForExpandRequest,
} from "../src/switcher";

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

describe("listenForExpandRequest", () => {
  const popup = () => new Window({ url: "https://ogs.google.com/u/0/widget/account" });
  const send = (win: Window, origin: string, type: string) =>
    win.dispatchEvent(new win.MessageEvent("message", { origin, data: { type } }));

  it("expands once when the top page asks", () => {
    const win = popup();
    let calls = 0;

    listenForExpandRequest(win as unknown as globalThis.Window, () => {
      calls += 1;
    });
    send(win, "https://www.google.co.jp", "account-switcher-for-google:expand");
    send(win, "https://www.google.co.jp", "account-switcher-for-google:expand");

    expect(calls).toBe(1);
  });

  it("ignores other origins and messages", () => {
    const win = popup();
    let calls = 0;

    listenForExpandRequest(win as unknown as globalThis.Window, () => {
      calls += 1;
    });
    send(win, "https://mail.google.com", "account-switcher-for-google:expand");
    send(win, "https://www.google.com", "something-else");

    expect(calls).toBe(0);
  });
});
