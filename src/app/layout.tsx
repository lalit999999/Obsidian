import type { Metadata } from "next";
import { Geist_Mono, Public_Sans, DM_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const dmSans = DM_Sans({subsets:['latin'],variable:'--font-sans'});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Obsidian AI",
    template: "%s | Obsidian AI",
  },
  description:
    "Build knowledge-base projects from your notes and chat with AI over your documents.",
  applicationName: "Obsidian AI",
  metadataBase: new URL("http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        dmSans.variable,
        geistMono.variable,
        "font-sans",
      )}
    >
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
