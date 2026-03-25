import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/SystemTheme/ThemeProvider";

const nunitoSans = Nunito_Sans({
  subsets:['latin'],
  variable:'--font-sans'
});

export const metadata: Metadata = {
  title: "Invoice Generator | Thaver Tech",
  description:
    "Create, manage, and download professional invoices instantly with Thaver Tech Invoice Generator.",

  keywords: [
    "invoice generator",
    "billing software",
    "create invoice online",
    "GST invoice India",
    "Thaver Tech",
  ],

  authors: [{ name: "Thaver Tech" }],

  openGraph: {
    title: "Invoice Generator | Thaver Tech",
    description:
      "Generate professional invoices in seconds. Fast, simple, and reliable.",
    url: "https://your-domain.com",
    siteName: "Thaver Tech",
    images: [
      {
        url: "/logo.png", // put inside /public
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Invoice Generator | Thaver Tech",
    description:
      "Create and download invoices instantly with Thaver Tech.",
    images: ["/logo.png"],
  },

  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", nunitoSans.className)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          {children}
        </ThemeProvider>
        </body>
    </html>
  );
}
