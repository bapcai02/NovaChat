import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/store/provider";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/components/providers/I18nProvider";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NovaChat - Enterprise Chat Platform",
  description: "Modern chat platform built with Next.js and Laravel",
};

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full antialiased`}>
        <Script id="nc-turn-config" strategy="beforeInteractive">
          {`
            (function(){
              try {
                var turnUrls = ${JSON.stringify(process.env.NEXT_PUBLIC_TURN_URLS || "")};
                var turnUser = ${JSON.stringify(process.env.NEXT_PUBLIC_TURN_USERNAME || "")};
                var turnCred = ${JSON.stringify(process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "")};
                var forceRelay = ${JSON.stringify(process.env.NEXT_PUBLIC_TURN_FORCE || "")};
                if (turnUrls && turnUser && turnCred) {
                  window.NC_TURN = {
                    urls: turnUrls.includes(',') ? turnUrls.split(',').map(function(s){return s.trim();}) : [turnUrls]
                    , username: turnUser
                    , credential: turnCred
                  };
                }
                if (forceRelay && (""+forceRelay).toLowerCase() === 'true') {
                  window.NC_TURN_FORCE = true;
                }
              } catch (e) {}
            })();
          `}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <ReduxProvider>
              <I18nProvider>{children}</I18nProvider>
            </ReduxProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export default RootLayout;
