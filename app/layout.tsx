"use client";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import Header from "./components/Header";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
    const checkAuth = async () => {
      if (typeof window !== "undefined") {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken && pathname !== "/login") {
          router.push("/login");
        } else if (accessToken && pathname === "/login") {
          return; // Do nothing if already on the login page
        } else if (accessToken) {
          try {
            const response = await fetch('https://api.4pmti.com/auth/user', {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            });

            if (response.status === 200 || response.status === 201) {
              const data = await response.json();
              localStorage.setItem('userData', JSON.stringify(data));
              setIsAuthenticated(true);
            } else if (response.status === 401) {
              localStorage.clear();
              router.push("/login");
            }
          } catch (error) {
            localStorage.clear();
            router.push("/login");
          }
        }
      }
    };

    checkAuth();
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
