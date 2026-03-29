"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserSwitcher } from "@/components/layout/UserSwitcher";

export function Topbar({ title }: { title?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] px-6 py-4">
      <div>
        <p className="text-lg font-semibold">{title ?? "Workspace"}</p>
        <p className="text-sm text-muted-foreground">
          Stay aligned with your team and stakeholders.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden w-72 lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks, updates..."
            className="pl-9 bg-card/90"
          />
        </div>
        <UserSwitcher />
      </div>
    </div>
  );
}
