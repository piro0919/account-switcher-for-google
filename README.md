# Account Switcher for Google

A Firefox extension for people signed in to several Google accounts. On the Google top page, your other accounts appear as a column of icons under your own, each with a Gmail link and a Google apps button beside it. One click switches account, opens that account's inbox, or opens Google's app launcher for that account.

## Install

Download the signed `.xpi` from the [latest release](https://github.com/piro0919/account-switcher-for-google/releases/latest) and open it in Firefox. Updates arrive automatically.

## Development

```sh
pnpm install
pnpm build      # outputs dist/
pnpm test
pnpm typecheck
pnpm lint
```

To try it, open `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and pick `dist/manifest.json`.

## License

MIT
