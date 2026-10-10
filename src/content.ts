import { AVATAR_SELECTOR, expand, requestPopupExpand } from "./switcher";

void expand(document, AVATAR_SELECTOR).then(
  (opened) => opened && requestPopupExpand(window),
);
