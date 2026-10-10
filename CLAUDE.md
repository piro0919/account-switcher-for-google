# Account Switcher for Google

Firefox extension. Opening www.google.com or www.google.co.jp (the top page only) opens the account popup at the top right and expands the list of other accounts. Built because clicking the avatar and then the chevron every time was tedious.

## What the first version does (and only this)

- `src/content.ts` runs on the top page and clicks the avatar (`a[href^="https://accounts.google.com/SignOutOptions"]`) until Google sets `aria-expanded="true"`, then posts a message to the popup iframe.
- `src/popup-frame.ts` runs inside the popup iframe (`ogs.google.com/*/widget/account`). On that message it clicks the only `[aria-expanded]` element, the current account card, which lists the other accounts.
- No popup, no settings, no icon in the toolbar.

## Decisions

- Top page only, by request. Search results, Gmail, Drive etc. are untouched.
- The same popup iframe is used by every Google service, and its `document.referrer` is cut down to the origin, so it cannot tell the top page from search results. It acts only when the top-page script asks through `postMessage`.
- The popup iframe is `about:blank` in its `src` and navigated later, so the message goes to every iframe with `targetOrigin` set to `https://ogs.google.com`; the browser drops it for the rest.
- Each click is paired with a one-shot `preventDefault` listener. A click that lands before Google attaches its handler would otherwise follow the avatar link to SignOutOptions; this way it does nothing and the next retry catches it.
- Name: "Google Account Switcher" was taken on AMO (slug `google-account-switcher`), so the brand goes last.
- The DOM was read from a real signed-in session. Playwright's browser is not signed in to Google, so check changes with `web-ext run --firefox-profile <your profile>` instead; it copies the profile, so the original is untouched. The copy goes to `$TMPDIR/copy-*` and is removed only when Firefox exits; killing web-ext leaves it behind (6.5 GB each, which filled the disk once). Quit Firefox itself, not web-ext.

## Commands

- `pnpm build` → `dist/`
- `pnpm test`, `pnpm typecheck`, `pnpm lint` (web-ext lint on `dist/`)

## Layout

- `src/` extension source, built to `dist/` by `build.mjs` (esbuild).
- `scripts/release.mjs` AMO unlisted signing, copied from Aikotoba. It talks to the AMO API directly because `web-ext sign` intermittently returns `Unknown JWT iss`.

## Release

The add-on ID is `account-switcher-for-google@piro0919` and can never change once signed.

1. Bump `version` in `src/manifest.json` (AMO never accepts the same version twice)
2. `AMO_JWT_ISSUER=... AMO_JWT_SECRET=... node scripts/release.mjs` — builds, signs, saves `web-ext-artifacts/account-switcher-for-google-X.Y.Z.xpi`, and appends the version to `lp/public/updates.json`
3. `gh release create vX.Y.Z web-ext-artifacts/account-switcher-for-google-X.Y.Z.xpi`
4. Commit and push `src/manifest.json` and `lp/public/updates.json`. The LP deploy publishes `https://account-switcher-for-google.kkweb.io/updates.json`, which installed copies poll through `update_url`

`update_link` points at the GitHub release asset, so do step 3 before step 4. Never hand-edit `update_hash`.

## Conventions

- Commit messages: English Conventional Commits, lowercase type/scope/body, no trailing period
- README and code comments in English
