"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";

interface UpdateItem {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string };
}

export function UpdateFeed({
  updates,
  projectId,
  onPosted,
}: {
  updates: UpdateItem[];
  projectId: string;
  onPosted: () => void;
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    await fetch("/api/updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, projectId }),
    });
    setContent("");
    setLoading(false);
    onPosted();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-[linear-gradient(180deg,var(--card),var(--card-alt))] p-4">
        <Textarea
          placeholder="Share an update with your stakeholders..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={submit} disabled={loading}>
            {loading ? "Posting..." : "Post update"}
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {updates.map((update) => (
          <div
            key={update.id}
            className="rounded-2xl border border-border bg-[linear-gradient(180deg,var(--card),var(--card-alt))] p-4"
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{update.author.name}</span>
              <span>{formatDateTime(update.createdAt)}</span>
            </div>
            <p className="mt-2 text-sm">{update.content}</p>
          </div>
        ))}
        {updates.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No updates yet. Start the conversation.
          </p>
        )}
      </div>
    </div>
  );
}
