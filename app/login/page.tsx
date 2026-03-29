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
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, role }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Unable to start session.");
      setLoading(false);
      return;
    }
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.25),_transparent_55%)] px-6 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-[linear-gradient(180deg,var(--card),var(--card-alt))] p-8 shadow-[var(--shadow)]">
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
          {error && (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </p>
          )}
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
