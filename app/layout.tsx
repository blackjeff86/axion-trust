import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AXION Trust",
  description: "Painel de gestão de risco e segurança AXION Trust",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300..700,0..1,-50..200"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var saved = localStorage.getItem("axion-theme-mode");
                  var mode = saved === "light" ? "light" : "dark";
                  document.documentElement.setAttribute("data-theme", mode);
                } catch (e) {
                  document.documentElement.setAttribute("data-theme", "dark");
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${manrope.variable} font-body`}>{children}</body>
    </html>
  );
}
