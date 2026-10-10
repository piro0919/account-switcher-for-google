# Account Switcher for Google

Firefox extension. On the Google top page (www.google.com / www.google.co.jp only), it lists the other signed-in accounts as a column of avatars under the top-right avatar, each with a "Gmail" link on its left. Clicking an avatar reopens the top page as that account; clicking "Gmail" opens that account's inbox. Built because switching through Google's own popup took three clicks.

The first idea was to open Google's account popup automatically; it was dropped once the user saw it (what they wanted was the column of icons). The history is in git.

## What the first version does (and only this)

- `src/background.ts` POSTs to `accounts.google.com/ListAccounts` (needs the host permission so cookies go along; the page itself is blocked by CORS) and returns the parsed list.
- `src/content.ts` runs on the top page, drops the current account (`authuser` in the URL, 0 when absent), and draws the column.
- Avatar links go to `/?authuser=N`; Gmail links go to `https://mail.google.com/mail/u/N/`.
- No hover text, no popup, no settings, no toolbar icon. All by request.

## Decisions

- `ListAccounts` answers only POST; GET returns 400. With `source=ChromiumBrowser` accounts without a photo get a grey silhouette, with `source=ogb&mo=1` they get the coloured initials Google itself shows. Two such accounts are otherwise indistinguishable.
- Circles are a fixed 32px, Google's avatar size. The avatar's img box is 40px for accounts that get a coloured ring, so reading it made ours too big.
- Position comes from the avatar link's box, not the img: the img may not have loaded and reports height 0, which made the column overlap the avatar.
- The column is anchored by its right edge (`translateX(-100%)`) so the circles stay under the avatar whatever width the Gmail labels take.
- The Gmail label copies font, size, weight and colour from Google's own "Gmail" link in the bar.
- `z-index: 1`. At 1000 it was drawn over Google's app launcher and account popups.
- Name: "Google Account Switcher" was taken on AMO (slug `google-account-switcher`), so the brand goes last.
- Playwright's browser is not signed in to Google, so check changes with `web-ext run --firefox-profile <your profile>`; it copies the profile, so the original is untouched. The copy goes to `$TMPDIR/copy-*` and is removed only when Firefox exits; killing web-ext leaves it behind (6.5 GB each, which filled the disk once). Quit the Firefox process itself, not web-ext.

## Commands

- `pnpm build` → `dist/`
- `pnpm test`, `pnpm typecheck`, `pnpm lint` (web-ext lint on `dist/`)

## Layout

- `src/` extension source, built to `dist/` by `build.mjs` (esbuild). `assets/icon.png` is the original icon from ChatGPT (a toggle-switch track holding three avatars, a pun on "Switcher"); `src/icons/` are the exported sizes.
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
