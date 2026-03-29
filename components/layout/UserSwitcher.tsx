"use client";

import { useEffect, useState } from "react";
import { ChevronDown, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "PM" | "DEV" | "STAKEHOLDER";
}

export function UserSwitcher() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/users", { cache: "no-store" });
      const data = await res.json();
      setUsers(data.users ?? []);
      setCurrentId(data.meId ?? null);
    };
    load();
  }, []);

  const current = users.find((user) => user.id === currentId);

  const switchUser = async (id: string) => {
    await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    setCurrentId(id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
            <User className="h-4 w-4" />
          </span>
          <span className="hidden text-left text-sm font-medium md:block">
            {current?.name ?? "Guest"}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {users.map((user) => (
            <DropdownMenuItem key={user.id} onClick={() => switchUser(user.id)}>
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user.role} - {user.email}
                </p>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
