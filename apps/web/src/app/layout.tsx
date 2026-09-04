import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "SAMADHAN",
    template: "%s | SAMADHAN"
  },
  description:
    "From citizen problems to real-world solutions - a civic innovation platform."
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#0a7d3f"
};

// Government portal: light by default. Dark is opt-in only (an explicit
// "samadhan:theme" = "dark" set by a future in-app toggle), never inferred
// from the OS setting.
const THEME_INIT = `
try {
  var stored = window.localStorage.getItem("samadhan:theme");
  document.documentElement.classList.toggle("dark", stored === "dark");
} catch (e) {}
`;

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={cn(inter.variable)} lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
