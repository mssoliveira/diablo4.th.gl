import { Metadata } from "next";
import { Inter } from "next/font/google";
import { I18NProvider } from "../components/(i18n)/i18n-provider";
import PlausibleTracker from "../components/plausible-tracker";
import "../globals.css";
import { DEFAULT_LOCALE, LOCALES, loadDictionary } from "../lib/i18n";
import { OverwolfRouterProvider } from "./components/overwolf-router";

const inter = Inter({ subsets: ["latin"] });

export function generateMetadata(): Metadata {
  return {
    title: {
      default: "Sanctuary | Diablo 4 Map",
      template: "%s | Diablo 4 Map",
    },
  };
}

function OverwolfLayout({ children }: { children: React.ReactNode }) {
  const lang = "en";
  const dict = loadDictionary(lang);

  return (
    <html lang={lang}>
      <body
        className={`${inter.className} h-screen flex flex-col text-white app antialiased select-none`}
      >
        <OverwolfRouterProvider>
          <I18NProvider
            value={{
              dict,
              defaultLocale: DEFAULT_LOCALE,
              locale: lang,
              locales: LOCALES,
            }}
          >
            {children}
          </I18NProvider>
        </OverwolfRouterProvider>
        <PlausibleTracker
          domain={process.env.NEXT_PUBLIC_PLAUSIBLE_OVERWOLF_DOMAIN}
          apiHost={process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST}
        />
      </body>
    </html>
  );
}

export default OverwolfLayout;
