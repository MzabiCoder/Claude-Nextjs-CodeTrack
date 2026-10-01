import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { MotionProvider } from "@/components/motion";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'DevCodeCave',
    template: '%s · DevCodeCave',
  },
  description: 'Your developer knowledge hub — snippets, prompts, commands, and more.',
  applicationName: 'DevCodeCave',
  openGraph: {
    title: 'DevCodeCave',
    description: 'Your developer knowledge hub — snippets, prompts, commands, and more.',
    siteName: 'DevCodeCave',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f7fb' },
    { media: '(prefers-color-scheme: dark)', color: '#12121f' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col scrollbar-slim" suppressHydrationWarning>
        <MotionProvider>{children}</MotionProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
