"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("DEV");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, role }),
    });
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_55%)] px-6 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-white p-8 shadow-lg">
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground">ProGer</p>
          <h1 className="text-2xl font-semibold">Choose your role</h1>
          <p className="text-sm text-muted-foreground">
            Start instantly with a role-based session.
          </p>
        </div>
        <div className="space-y-4">
          <Input
            placeholder="Display name (optional)"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PM">PM</SelectItem>
              <SelectItem value="DEV">DEV</SelectItem>
              <SelectItem value="STAKEHOLDER">Stakeholder</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full" onClick={submit} disabled={loading}>
            {loading ? "Starting..." : "Continue"}
          </Button>
          <p className="text-xs text-muted-foreground">
            No email required. You can switch roles anytime from the top bar.
          </p>
        </div>
      </div>
    </div>
  );
}
