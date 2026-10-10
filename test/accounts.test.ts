import { describe, expect, it } from "vitest";
import { currentAuthuser, parseAccounts } from "../src/accounts";

// Shape taken from a real response, with the ids shortened.
const BODY = JSON.stringify([
  "gaia.l.a.r",
  [
    ["gaia.l.a", 1, "Kouhei Kawamura", "a@gmail.com", "https://lh3.googleusercontent.com/-a/s48-c/photo.jpg", 1, 1, 0, null, 1, "1", null, null, null, null, 1, "Kouhei"],
    ["gaia.l.a", 1, "河村康平", "b@gmail.com", "https://lh3.googleusercontent.com/-b/s48-c/photo.jpg", 0, 0, 1, null, 1, "2", null, null, null, null, 1, "康平"],
    ["gaia.l.a", 1, "河村康平", "c@example.co.jp", "https://lh3.googleusercontent.com/-c/s48-c/photo.jpg", 0, 0, 2, null, 1, "3", null, null, null, null, 1, "康平"],
  ],
]);

describe("parseAccounts", () => {
  it("reads authuser, email and a 64px photo from each entry", () => {
    expect(parseAccounts(BODY)).toEqual([
      { authuser: 0, email: "a@gmail.com", photo: "https://lh3.googleusercontent.com/-a/s64-c/photo.jpg" },
      { authuser: 1, email: "b@gmail.com", photo: "https://lh3.googleusercontent.com/-b/s64-c/photo.jpg" },
      { authuser: 2, email: "c@example.co.jp", photo: "https://lh3.googleusercontent.com/-c/s64-c/photo.jpg" },
    ]);
  });

  it("returns nothing for an unexpected shape", () => {
    expect(parseAccounts('["gaia.l.a.r"]')).toEqual([]);
    expect(parseAccounts('["gaia.l.a.r", [["gaia.l.a", 1]]]')).toEqual([]);
  });
});

describe("currentAuthuser", () => {
  it.each([
    ["https://www.google.com/", 0],
    ["https://www.google.com/?authuser=2", 2],
    ["https://www.google.co.jp/?hl=ja&authuser=1", 1],
    ["https://www.google.com/?authuser=x", 0],
  ])("%s → %d", (href, expected) => {
    expect(currentAuthuser(href)).toBe(expected);
  });
});
