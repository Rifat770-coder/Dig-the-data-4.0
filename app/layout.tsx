import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthModeProvider } from "@/lib/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dig The Data 4.0 - Data Analytics Platform",
  description: "Join our community of data enthusiasts and unlock the power of data analytics. Organized by NITER Computer Club (NCC).",
  keywords: ["data analytics", "NITER", "computer club", "data science", "competition"],
  authors: [{ name: "NITER Computer Club" }],
  creator: "NITER Computer Club",
  publisher: "NITER Computer Club",
  openGraph: {
    title: "Dig The Data 4.0 - Data Analytics Platform",
    description: "Join our community of data enthusiasts and unlock the power of data analytics",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dig The Data 4.0",
    description: "Data Analytics Platform by NITER Computer Club",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#000D32" />
        <meta name="color-scheme" content="dark light" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-x-hidden`}
        suppressHydrationWarning
      >
        {/* Global Background Pattern */}
        <div className="fixed inset-0 z-0 opacity-30">
          <div className="absolute inset-0 grid-pattern"></div>
          <div className="absolute inset-0 dot-pattern"></div>
        </div>
        
        {/* Main Content */}
        <div className="relative z-10">
          <AuthModeProvider>
            {children}
          </AuthModeProvider>
        </div>
        
        {/* Global Loading Indicator */}
        <div id="global-loading" className="hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
              <p className="text-cyan-400 font-medium">Loading...</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
