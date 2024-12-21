"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "./components/Header";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useMemo, useEffect, useState } from "react";

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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { id } = useParams();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthWrapper>
          <div className="flex h-screen bg-gray-100">
            {/* {!isLoginPage && <Sidebar />} */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {!isLoginPage && <Header />}
              <main className="flex-1 overflow-x-hidden mx-auto max-w-7xl w-full overflow-y-auto bg-gray-100 p-2">
                {children}
              </main>
            </div>
          </div>
        </AuthWrapper>
      </body>
    </html>
  );
}
