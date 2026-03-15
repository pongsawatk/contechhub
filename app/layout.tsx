import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Contech Hub — Internal Platform",
  description: "Internal Platform — Builk One Group",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <Providers>
          <div className="app-background">
            {/* Decorative blurred orbs */}
            <div className="orb orb-1" aria-hidden="true" />
            <div className="orb orb-2" aria-hidden="true" />
            <div className="orb orb-3" aria-hidden="true" />

            {/* Page content above orbs */}
            <div className="relative z-[1] min-h-screen">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
