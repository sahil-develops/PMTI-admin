"use client";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import Header from "./components/Header";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useMemo, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";

// Configure the Inter font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

// Configure JetBrains Mono for monospace
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

// AuthWrapper component to handle authentication
const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken && pathname !== "/login") {
        router.push("/login");
      } else if (accessToken && pathname === "/login") {
        router.push("/");
      }
      setIsAuthenticated(!!accessToken);
    }
  }, [pathname, router]);

  if (pathname === "/login" || isAuthenticated) {
    return <>{children}</>;
  }

  return null;
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-full bg-background font-sans antialiased">
        <AuthWrapper>
          <div className="flex flex-col h-full bg-white">
            {!isLoginPage && <Header />}
            <div className="flex-1 flex flex-col overflow-hidden">
              <main className="flex-1 overflow-x-hidden mx-auto max-w-full w-full overflow-y-auto bg-gray-100 p-2 h-full">
                {children}
              </main>
            </div>
          </div>
        </AuthWrapper>
        <Toaster />
      </body>
    </html>
  );
}
