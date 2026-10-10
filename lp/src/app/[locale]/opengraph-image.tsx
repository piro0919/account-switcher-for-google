import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { routing } from "@/i18n/routing";

export const alt = "Account Switcher for Google";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Rendered at build time. Left dynamic, public/ is not bundled with the
   function and production returns 500 because icon.png can't be read */
export function generateStaticParams(): { locale: string }[] {
  return routing.locales.map((locale) => ({ locale }));
}

/* Shown at 176px in the kk-web list and around 500px on X cards. At that
   size only the icon, the name and one line survive. Colours come from the icon */
const PAPER = "#f7f8fa";
const INK = "#14263b";
const KNOB = "#d65f00";

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<ImageResponse> {
  const { locale } = await params;
  const isJa = locale === "ja";
  /* Same heading face as the site, Zen Maru Gothic, bundled as a subset of
     just the characters used. Rebuild it per assets/README.md when the copy changes */
  const [icon, font] = await Promise.all([
    readFile(join(process.cwd(), "public/icon.png")),
    readFile(join(process.cwd(), "assets/ZenMaruGothic-Bold-subset.ttf")),
  ]);
  const iconSrc = `data:image/png;base64,${icon.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: PAPER,
        display: "flex",
        gap: 64,
        height: "100%",
        justifyContent: "center",
        padding: "0 90px",
        width: "100%",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: next/image is not available in ImageResponse */}
      <img alt="" height={280} src={iconSrc} style={{ borderRadius: 56 }} width={280} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* The name is too long for one line at this size, so it breaks before "for" */}
        <div
          style={{
            color: INK,
            display: "flex",
            flexDirection: "column",
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: -1.5,
            lineHeight: 1.1,
          }}
        >
          <div>Account Switcher</div>
          <div>for Google</div>
        </div>
        <div
          style={{
            color: KNOB,
            display: "flex",
            flexDirection: "column",
            fontSize: 40,
            lineHeight: 1.4,
            marginTop: 24,
          }}
        >
          {(isJa
            ? ["Google アカウントを、", "トップでひと押し"]
            : ["Your Google accounts,", "one click away"]
          ).map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [{ data: font, name: "Zen Maru Gothic", style: "normal", weight: 700 }],
    },
  );
}
