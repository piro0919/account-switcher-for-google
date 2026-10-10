import { Coffee, Download, Github, Search } from "lucide-react";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

const GITHUB_URL = "https://github.com/piro0919/account-switcher-for-google";
const COFFEE_URL = "https://buymeacoffee.com/piro0919";
const RELEASE_URL = "https://github.com/piro0919/account-switcher-for-google/releases/latest";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: PageProps): Promise<ReactNode> {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <main>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <Image
            alt="Account Switcher for Google"
            className="rounded-lg"
            height={28}
            priority={true}
            src="/icon.png"
            width={28}
          />
          <span className="text-sm font-semibold">Account Switcher for Google</span>
        </div>
        <a
          className="inline-flex items-center gap-1.5 text-sm text-ink-2 transition-colors hover:text-navy"
          href={GITHUB_URL}
        >
          <Github size={15} strokeWidth={1.75} />
          {t("Hero.viewOnGithub")}
        </a>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 pt-10 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pt-16 lg:pb-28">
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-[0.25em] text-knob-deep uppercase">
            Firefox Extension
          </p>
          <h1 className="mt-6 font-display text-4xl leading-[1.2] font-bold tracking-tight whitespace-pre-line sm:text-5xl">
            {t("Hero.title")}
          </h1>
          <p className="mt-6 max-w-md leading-relaxed text-ink-2">{t("Hero.description")}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-navy-deep"
              href={RELEASE_URL}
            >
              <Download size={18} strokeWidth={2} />
              {t("Hero.download")}
            </a>
            <a
              className="inline-flex items-center justify-center gap-2 rounded-full border border-hairline px-6 py-3.5 text-base font-semibold transition-colors hover:border-navy hover:text-navy"
              href={GITHUB_URL}
            >
              <Github size={18} strokeWidth={2} />
              {t("Hero.viewOnGithub")}
            </a>
          </div>
          <p className="mt-6 font-mono text-xs text-ink-2">{t("Hero.note")}</p>
        </div>

        <div className="min-w-0">
          <PageMockup imagesLabel={t("Mockup.images")} />
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-10 sm:flex-row sm:justify-between">
        <span className="text-sm text-ink-2">
          Made by{" "}
          <a className="text-ink-1 transition-colors hover:text-navy" href={GITHUB_URL}>
            piro0919
          </a>
        </span>
        <div className="flex items-center gap-5">
          <a
            className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-2 transition-colors hover:text-navy"
            href={COFFEE_URL}
          >
            <Coffee size={13} strokeWidth={1.75} />
            Buy Me a Coffee
          </a>
          <a
            className="font-mono text-xs text-ink-2 transition-colors hover:text-navy"
            href={GITHUB_URL}
          >
            {t("Hero.viewOnGithub")}
          </a>
        </div>
      </footer>
    </main>
  );
}

type Avatar = {
  color: string;
  letter: string;
};

const CURRENT: Avatar = { color: "#ff7200", letter: "K" };
const OTHERS: Avatar[] = [
  { color: "#2f5fa7", letter: "W" },
  { color: "#7a4fb0", letter: "P" },
];

/* The top right of the Google top page, redrawn: Google's own bar on the
   first row, and the two rows the extension adds under the avatar. The
   second avatar is the one being clicked. No Google logo. */
function PageMockup({ imagesLabel }: { imagesLabel: string }): ReactNode {
  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-card-line bg-card shadow-[0_30px_60px_-30px_rgba(20,38,59,0.35)]">
      <div className="flex items-center gap-1.5 border-b border-card-line px-4 py-3">
        <span className="size-2.5 rounded-full bg-card-line" />
        <span className="size-2.5 rounded-full bg-card-line" />
        <span className="size-2.5 rounded-full bg-card-line" />
      </div>
      <div className="px-5 pt-4 pb-10">
        <div className="flex items-center justify-end gap-4 text-[13px]">
          <span>Gmail</span>
          <span>{imagesLabel}</span>
          <AppsGrid />
          <Circle avatar={CURRENT} />
        </div>
        <div className="mt-3 flex flex-col items-end gap-3 text-[13px]">
          {OTHERS.map((avatar, index) => (
            <div className="flex items-center gap-4" key={avatar.letter}>
              <span>Gmail</span>
              <Circle avatar={avatar} pressed={index === 0} />
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 flex h-10 max-w-60 items-center rounded-full border border-card-line px-4 text-mute">
          <Search size={16} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

function Circle({ avatar, pressed = false }: { avatar: Avatar; pressed?: boolean }): ReactNode {
  return (
    <span
      className={`flex size-8 items-center justify-center rounded-full text-sm font-medium text-white ${pressed ? "press" : ""}`}
      style={{ background: avatar.color }}
    >
      {avatar.letter}
    </span>
  );
}

function AppsGrid(): ReactNode {
  return (
    <span aria-hidden="true" className="grid grid-cols-3 gap-[3px]">
      {Array.from({ length: 9 }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed decorative dots
        <span className="size-[4px] rounded-full bg-ink-2" key={index} />
      ))}
    </span>
  );
}
