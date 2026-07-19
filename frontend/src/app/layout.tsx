import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { SiteChrome } from "@/components/ui/SiteChrome";
import { RestaurantJsonLd } from "@/components/seo/RestaurantJsonLd";
import { getSiteSettings } from "@/lib/site-settings";
import { SITE_URL } from "@/lib/env";
import { unsplash } from "@/lib/unsplash";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${settings.name} — A Table Worth the Walk`,
      template: `%s — ${settings.name}`,
    },
    description: settings.description ?? undefined,
    icons: settings.favicon_url ? { icon: settings.favicon_url } : undefined,
    openGraph: {
      type: "website",
      siteName: settings.name,
      title: `${settings.name} — ${settings.tagline ?? ""}`,
      description: settings.description ?? undefined,
      images: [
        {
          url: unsplash("1414235077428-338989a2e8c0", 1200),
          width: 1200,
          height: 800,
          alt: `A plated dish at a candlelit ${settings.name} table`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${settings.name} — ${settings.tagline ?? ""}`,
      description: settings.description ?? undefined,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#2E1E12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-linen text-charcoal font-body">
        <RestaurantJsonLd />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
