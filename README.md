# Account Switcher for Google

A Firefox extension that opens the account list when you open the Google top page. If you are signed in to several Google accounts, the other accounts are already listed, so switching takes one click.

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
