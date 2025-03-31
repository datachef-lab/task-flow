import "@/lib/cronjob-scheduler";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { SocketProvider } from "@/components/providers/socket-provider";
import { Toaster } from "@/components/ui/toaster";

import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Task Flow",
  description: "",
  generator: "DataChef",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <SocketProvider>
            {children}
            <Toaster />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
