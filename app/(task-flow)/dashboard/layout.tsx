"use client";

import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { store } from "@/store/store";
import React from "react";
import { Provider } from "react-redux";
import { NotificationToaster } from "@/components/notifications/notification-toast";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <MainNav />
        <div className="ml-auto flex items-center gap-4">
          <UserNav />
        </div>
      </header>
      <Provider store={store}>
        {children}
        <NotificationToaster />
      </Provider>
    </div>
  );
}
