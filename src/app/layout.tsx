import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "One Campus",
  description: "Created By Team Vikram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <AuthProvider>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </AuthProvider>
    </html>
  );
}
