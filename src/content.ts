import { type Account, currentAuthuser } from "./accounts";

// The avatar at the top right is a link to SignOutOptions; signed out, it is missing.
const AVATAR_SELECTOR = 'a[href^="https://accounts.google.com/SignOutOptions"]';
// Google's own "Gmail" link in the bar, copied so ours reads the same.
const GMAIL_SELECTOR = 'a[href^="https://mail.google.com/"]';
const GAP = 12;
const GMAIL_GAP = 16;
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

function render(avatar: HTMLElement, accounts: Account[]): void {
  const model = document.querySelector<HTMLElement>(GMAIL_SELECTOR);
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
  window.addEventListener("resize", place);

  for (const account of accounts) {
    const row = document.createElement("div");
    const link = document.createElement("a");
    const icon = document.createElement("img");

    row.style.cssText = `display:flex;align-items:center;gap:${GMAIL_GAP}px`;
    link.href = `${location.origin}/?authuser=${account.authuser}`;
    link.setAttribute("aria-label", account.email);
    link.style.cssText = `display:block;width:${SIZE}px;height:${SIZE}px;border-radius:50%;overflow:hidden`;
    icon.src = account.photo;
    icon.alt = "";
    icon.style.cssText = "display:block;width:100%;height:100%";
    link.append(icon);
    row.append(gmailLink(account.authuser, model), link);
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
