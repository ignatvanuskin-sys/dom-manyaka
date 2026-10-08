import type { Metadata, Viewport } from "next";
import { Inter, Oswald, Playfair_Display } from "next/font/google";
import { company, rating, SITE_URL } from "@/lib/content";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  style: ["italic", "normal"],
  variable: "--font-playfair",
  display: "swap",
});

const title = "Дом Маньяка — хоррор-квест в Алматы на Манаса, 57";
const description =
  "Атмосферный хоррор-квест «Дом Маньяка» в Алматы: 60 минут, 2–20 игроков, актёры внутри. 4.6 на 2ГИС. Бронь — WhatsApp +7 701 822 92 84.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: "%s · Дом Маньяка",
  },
  description,
  applicationName: company.latin,
  keywords: [
    "хоррор-квест Алматы",
    "квест Алматы",
    "Дом Маньяка",
    "квест Манаса 57",
    "страшный квест Алматы",
    "квест с актёрами Алматы",
    "куда сходить в Алматы",
  ],
  authors: [{ name: company.latin }],
  creator: company.latin,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_KZ",
    url: SITE_URL,
    siteName: "Дом Маньяка",
    title,
    description,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Дом Маньяка — хоррор-квест в Алматы",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "entertainment",
  other: {
    "geo.position": `${company.geo.lat};${company.geo.lon}`,
    "geo.placename": "Алматы",
    rating: `${rating.value}/5 (${rating.source}, ${rating.ratings} оценок)`,
  },
};

export const viewport: Viewport = {
  themeColor: "#070609",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${oswald.variable} ${inter.variable} ${playfair.variable}`}
    >
      <head>
        {/* Если JavaScript не выполнится (отключён, заблокирован, не догрузился
            бандл), контент обязан остаться доступным. Иначе прелоадер
            остаётся висеть поверх страницы и посетитель видит чёрный экран. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;filter:none!important;clip-path:none!important}[data-preloader]{display:none!important}#faq dl div>dd{height:auto!important;opacity:1!important;overflow:visible!important}`}</style>
        </noscript>
      </head>
      <body className="antialiased">
        <a
          href="#quest"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-bone focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-void"
        >
          Перейти к содержимому
        </a>
        {children}
      </body>
    </html>
  );
}
