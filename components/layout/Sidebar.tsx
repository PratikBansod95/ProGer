import Link from "next/link";
import { cn } from "@/lib/utils";
import { Calendar, LayoutGrid, Layers } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/projects", label: "Projects", icon: Layers },
  { href: "/calendar", label: "Calendar", icon: Calendar },
];

export function Sidebar({ currentPath }: { currentPath: string }) {
  return (
    <aside className="hidden h-full w-64 flex-col gap-8 border-r border-border bg-[linear-gradient(180deg,#f7fbff,#edf3ff)] px-6 py-8 lg:flex">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[conic-gradient(from_180deg,var(--primary),var(--accent))] text-primary-foreground shadow-[0_10px_24px_rgba(90,120,160,0.2)]">
          <span className="text-lg font-semibold">P</span>
        </div>
        <div>
          <p className="text-lg font-semibold">ProGer</p>
          <p className="text-xs text-muted-foreground">Project Command</p>
        </div>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const active = currentPath.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-2 text-sm font-medium transition",
                active
                  ? "bg-white text-foreground shadow-[0_10px_20px_rgba(90,120,160,0.18)]"
                  : "text-muted-foreground hover:bg-white/70"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl border border-dashed border-border bg-white/70 p-4 text-xs text-muted-foreground">
        Tip: Drag tasks across lanes to update status instantly.
      </div>
    </aside>
  );
}
