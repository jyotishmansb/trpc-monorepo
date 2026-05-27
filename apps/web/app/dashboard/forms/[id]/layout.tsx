"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { trpc } from "~/trpc/client";

const tabs = [
  { label: "Builder", href: "" },
  { label: "Responses", href: "/responses" },
  { label: "Analytics", href: "/analytics" },
  { label: "Settings", href: "/settings" },
];

export default function FormDetailLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const id = params.id as string;
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Sub-nav tabs */}
      <div className="border-b bg-card px-6 flex items-center gap-1 shrink-0 pt-1">
        {tabs.map((tab) => {
          const href = `/dashboard/forms/${id}${tab.href}`;
          const isActive = tab.href === ""
            ? pathname === href
            : pathname.startsWith(href);
          return (
            <Link
              key={tab.label}
              href={href}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
