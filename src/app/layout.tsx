import type { Metadata, Viewport } from "next";
import Script from "next/script";
import './globals.css';
import { dancingScript, montserrat, lexend } from "./fonts";

export const metadata: Metadata = {
  title: "the-platapus",
  description: "Personal Portfolio",
  other: {
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};
export const viewport: Viewport = {
  themeColor: "#2b3a4f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dancingScript.variable} ${montserrat.variable} ${lexend.variable}`}>
      <body>
        {children}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-JS8V71VTCQ"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JS8V71VTCQ');
          `}
        </Script>
      </body>
    </html>
  );
}
