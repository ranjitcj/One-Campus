import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "One Campus - Authentication",
  description: "Authentication pages for One Campus",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {children}
    </div>
  );
} 