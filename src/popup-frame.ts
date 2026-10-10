import { ACCOUNTS_SELECTOR, expand, listenForExpandRequest } from "./switcher";

listenForExpandRequest(window, () => void expand(document, ACCOUNTS_SELECTOR));
