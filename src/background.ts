import { LIST_ACCOUNTS_URL, parseAccounts } from "./accounts";

// The page cannot call accounts.google.com itself (CORS), so the content
// script asks here, where the host permission lets the request carry cookies.
browser.runtime.onMessage.addListener(async (message: unknown) => {
  if (message !== "list-accounts") return undefined;

  const response = await fetch(LIST_ACCOUNTS_URL, { credentials: "include", method: "POST" });

  return response.ok ? parseAccounts(await response.text()) : [];
});
