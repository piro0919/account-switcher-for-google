// The account list the Google bar itself loads. It only answers POST; GET
// returns 400. Asked as the bar (source=ogb), photo URLs for accounts without
// a picture point at the coloured initials instead of a grey silhouette.
export const LIST_ACCOUNTS_URL =
  "https://accounts.google.com/ListAccounts?listPages=0&pid=1&gpsia=1&source=ogb&mo=1&mn=1&hl=ja";

export type Account = {
  authuser: number;
  email: string;
  photo: string;
};

/**
 * The response is ["gaia.l.a.r", [entry, ...]], where each entry is
 * ["gaia.l.a", 1, name, email, photoUrl, ?, ?, authuser, ...].
 */
export function parseAccounts(body: string): Account[] {
  const data: unknown = JSON.parse(body);

  if (!Array.isArray(data) || !Array.isArray(data[1])) return [];

  return data[1].flatMap((entry: unknown) => {
    if (!Array.isArray(entry)) return [];

    const [, , , email, photo, , , authuser] = entry;

    if (typeof email !== "string" || typeof photo !== "string" || typeof authuser !== "number") {
      return [];
    }

    // The URL asks for a 48px image; 64px stays sharp on a 2x screen.
    return [{ authuser, email, photo: photo.replace("/s48-c/", "/s64-c/") }];
  });
}

/** The top page has no authuser parameter for the default account, which is 0. */
export function currentAuthuser(href: string): number {
  const value = new URL(href).searchParams.get("authuser");

  return value && /^\d+$/.test(value) ? Number(value) : 0;
}
