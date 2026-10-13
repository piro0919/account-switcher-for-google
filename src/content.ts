import { type Account, currentAuthuser } from "./accounts";

// The avatar at the top right is a link to SignOutOptions; signed out, it is missing.
const AVATAR_SELECTOR = 'a[href^="https://accounts.google.com/SignOutOptions"]';
// Google's own "Gmail" link in the bar, copied so ours reads the same.
const GMAIL_SELECTOR = 'a[href^="https://mail.google.com/"]';
// Google's app launcher button (the nine dots), cloned so ours looks and reacts the same.
const LAUNCHER_SELECTOR = 'a[href*="/about/products"]';
const GAP = 12;
// As in Google's bar: 15px from a text link to the launcher button, 12px from
// the button to the photo. The button is 40px, so it reaches 4px past a 32px row.
const LAUNCHER_GAP = 15;
const AVATAR_GAP = 12;
const BUTTON_OVERHANG = 4;
// Between Gmail and the photo when the launcher button is missing.
const GMAIL_GAP = 16;
// Google's popup is a 370x570 iframe placed 5.5px below its button and
// reaching 31px past the button's right edge. Rounding and shadow are drawn
// inside the iframe, so the same frame looks the same.
const POPUP_WIDTH = 370;
const POPUP_HEIGHT = 570;
const POPUP_TOP = 5.5;
const POPUP_RIGHT = 31;
// Google's own popup sits at 991, above the page but under its own menus.
const POPUP_Z_INDEX = 991;
// Google's avatar photo is 32px. Some accounts get a coloured ring drawn inside
// the image box, which then measures 40px, so the size is fixed rather than read.
const SIZE = 32;
const COPIED_STYLES = ["color", "fontFamily", "fontSize", "fontWeight", "letterSpacing"] as const;

function gmailLink(authuser: number, model: HTMLElement | null): HTMLAnchorElement {
  const link = document.createElement("a");

  link.href = `https://mail.google.com/mail/u/${authuser}/`;
  link.textContent = model?.textContent?.trim() || "Gmail";
  link.style.textDecoration = "none";

  if (model) {
    const style = getComputedStyle(model);

    for (const key of COPIED_STYLES) link.style[key] = style[key];
  }

  return link;
}

// The parameters Google's bar sends; with them the frame matches the real
// popup, favourites section and dark theme included.
function launcherUrl(authuser: number): string {
  const params = new URLSearchParams({
    eom: "1",
    awwd: "1",
    gpa: "4",
    em: "2",
    scv: "1",
    origin: location.origin,
    cn: "app",
    pid: "1",
    spid: "538",
    hl: document.documentElement.lang || "en",
    dm: "",
  });

  return `https://ogs.google.com/u/${authuser}/widget/app?${params}`;
}

type Launcher = { button: HTMLElement; popup: HTMLDivElement };

let openLauncher: Launcher | undefined;

function closeLauncher(): void {
  if (!openLauncher) return;

  openLauncher.popup.style.display = "none";
  openLauncher.button.setAttribute("aria-expanded", "false");
  openLauncher = undefined;
}

function placeLauncher(): void {
  if (!openLauncher) return;

  const box = openLauncher.button.getBoundingClientRect();

  openLauncher.popup.style.left = `${box.right + POPUP_RIGHT - POPUP_WIDTH + window.scrollX}px`;
  openLauncher.popup.style.top = `${box.bottom + POPUP_TOP + window.scrollY}px`;
}

// Google styles the button through its ancestors in the bar (colour, icon
// size, hover circle), so the clone is wrapped in empty copies of them. With
// display:contents they add no boxes, and only their classes are kept.
function inBarContext(button: HTMLElement, model: HTMLElement): HTMLElement {
  let node = button;

  for (let ancestor = model.parentElement; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
    const wrapper = document.createElement(ancestor.tagName);

    wrapper.className = ancestor.className;
    wrapper.style.display = "contents";
    wrapper.append(node);
    node = wrapper;

    if (ancestor.id === "gb") break;
  }

  return node;
}

function launcherButton(authuser: number, model: HTMLElement): HTMLElement {
  const button = model.cloneNode(true) as HTMLElement;
  let popup: HTMLDivElement | undefined;

  button.style.margin = `-${BUTTON_OVERHANG}px ${AVATAR_GAP}px -${BUTTON_OVERHANG}px ${LAUNCHER_GAP}px`;
  button.setAttribute("aria-expanded", "false");
  button.addEventListener("click", (event) => {
    // Kept from Google's own handlers, which would open the real launcher.
    event.preventDefault();
    event.stopPropagation();

    const wasOpen = openLauncher?.button === button;

    closeLauncher();

    if (wasOpen) return;

    // Loaded on first open only, not one frame per account up front.
    if (!popup) {
      const frame = document.createElement("iframe");

      popup = document.createElement("div");
      popup.style.cssText = `position:absolute;z-index:${POPUP_Z_INDEX};width:${POPUP_WIDTH}px;height:${POPUP_HEIGHT}px;overflow:hidden`;
      frame.src = launcherUrl(authuser);
      frame.setAttribute("frameborder", "0");
      frame.setAttribute("scrolling", "no");
      frame.style.cssText = "display:block;width:100%;height:100%;color-scheme:light";
      popup.append(frame);
      document.body.append(popup);
    }

    popup.style.display = "block";
    button.setAttribute("aria-expanded", "true");
    openLauncher = { button, popup };
    placeLauncher();
  });

  return inBarContext(button, model);
}

function render(avatar: HTMLElement, accounts: Account[]): void {
  const model = document.querySelector<HTMLElement>(GMAIL_SELECTOR);
  const launcherModel = document.querySelector<HTMLElement>(LAUNCHER_SELECTOR);
  const list = document.createElement("div");
  const place = () => {
    // Measured on the link, not the img: the img may not have loaded yet and
    // would report a height of 0. The photo sits centred in the link.
    const box = avatar.getBoundingClientRect();
    const centerX = box.left + box.width / 2 + window.scrollX;
    const centerY = box.top + box.height / 2 + window.scrollY;

    list.style.left = `${centerX + SIZE / 2}px`;
    list.style.top = `${centerY + SIZE / 2 + GAP}px`;
  };

  // Anchored by its right edge so the circles stay under the avatar whatever
  // width the Gmail labels take.
  list.style.cssText = `position:absolute;z-index:1;display:flex;flex-direction:column;align-items:flex-end;gap:${GAP}px;transform:translateX(-100%)`;
  place();
  // The avatar follows the right edge of the window.
  window.addEventListener("resize", () => {
    place();
    placeLauncher();
  });
  // Clicks inside the popup's frame never reach this document, so any click
  // here is outside it. Caught on the way down, because Google's own launcher
  // button stops the click from bubbling. The open button's own click is left
  // to it, so that it toggles.
  document.addEventListener(
    "click",
    (event) => {
      if (openLauncher && !event.composedPath().includes(openLauncher.button)) closeLauncher();
    },
    true,
  );
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLauncher();
  });

  for (const account of accounts) {
    const row = document.createElement("div");
    const link = document.createElement("a");
    const icon = document.createElement("img");

    row.style.cssText = "display:flex;align-items:center";
    link.href = `${location.origin}/?authuser=${account.authuser}`;
    link.setAttribute("aria-label", account.email);
    link.style.cssText = `display:block;width:${SIZE}px;height:${SIZE}px;border-radius:50%;overflow:hidden`;
    icon.src = account.photo;
    icon.alt = "";
    icon.style.cssText = "display:block;width:100%;height:100%";
    link.append(icon);
    row.append(gmailLink(account.authuser, model));
    if (launcherModel) row.append(launcherButton(account.authuser, launcherModel));
    else link.style.marginLeft = `${GMAIL_GAP}px`;
    row.append(link);
    list.append(row);
  }

  document.body.append(list);
}

async function main(): Promise<void> {
  const avatar = document.querySelector<HTMLElement>(AVATAR_SELECTOR);

  if (!avatar) return;

  const accounts: Account[] = await browser.runtime.sendMessage("list-accounts");
  const current = currentAuthuser(location.href);
  const others = accounts.filter((account) => account.authuser !== current);

  if (others.length > 0) render(avatar, others);
}

void main();
