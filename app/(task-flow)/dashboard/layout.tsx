"use client";

import { MainNav } from "@/components/main-nav";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import { store } from "@/store/store";
import { Bell } from "lucide-react";
import React from "react";
import { Provider } from "react-redux";

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
          {/* <DatePickerWithRange date={dateRange} setDate={setDateRange} /> */}
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              3
            </span>
          </Button>
          <UserNav />
        </div>
      </header>
      <Provider store={store}>{children}</Provider>
    </div>
  );
}
