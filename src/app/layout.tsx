import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { auth } from '@/auth'
import { Providers } from "@/components/providers/session-provider";
import AuthErrorBoundary from "@/components/auth-error-boundary";
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
  title: "Koerner 360",
  description: "Sistema completo de gestão de atendentes",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthErrorBoundary>
          <Providers session={session}>
            {children}
          </Providers>
        </AuthErrorBoundary>
      </body>
    </html>
  );
}
