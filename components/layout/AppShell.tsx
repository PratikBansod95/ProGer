"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function AppShell({
  children,
  currentPath,
  title,
}: {
  children: ReactNode;
  currentPath: string;
  title?: string;
}) {
  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.2),_transparent_55%)]">
      <Sidebar currentPath={currentPath} />
      <div className="flex min-h-screen w-full flex-col">
        <Topbar title={title} />
        <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
