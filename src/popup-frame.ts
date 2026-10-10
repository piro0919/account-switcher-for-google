import { ACCOUNTS_SELECTOR, expand, isFromTopPage } from "./switcher";

if (isFromTopPage(document.referrer)) void expand(document, ACCOUNTS_SELECTOR);
