import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "./redux/StoreProvider";
import CartDrawer from "./components/cart/CartDrawer";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Terra Harvest — Premium Dehydrated Fruits",
    template: "%s | Terra Harvest",
  },
  description:
    "Naturally preserved, purely delicious. Discover our handcrafted collection of premium dehydrated fruits, sourced from organic farms and prepared with artisanal care.",
  keywords: [
    "dehydrated fruits",
    "dried fruits",
    "organic snacks",
    "natural fruits",
    "premium dried fruits",
    "healthy snacks",
    "fruit powder",
    "artisanal food",
  ],
  authors: [{ name: "Terra Harvest" }],
  creator: "Terra Harvest",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Terra Harvest",
    title: "Terra Harvest — Premium Dehydrated Fruits",
    description:
      "Naturally preserved, purely delicious. Handcrafted dehydrated fruits from organic farms.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Terra Harvest — Premium Dehydrated Fruits",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terra Harvest — Premium Dehydrated Fruits",
    description: "Naturally preserved, purely delicious. Shop our handcrafted dehydrated fruit collection.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  category: "food & drink",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col">
        <StoreProvider>
          {children}
          <CartDrawer />
        </StoreProvider>
      </body>
    </html>
  );
}
