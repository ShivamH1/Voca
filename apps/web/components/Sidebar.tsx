"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Upload", icon: "upload_file", href: "/upload" },
  { label: "History", icon: "history", href: "/history" },
  { label: "Results", icon: "dashboard", href: "/results" },
  { label: "Ask Voca", icon: "auto_awesome", href: "/chat" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-72 flex-col p-lg bg-surface-elevated border-r border-hairline-strong pt-24">
      <div className="mb-xxl px-md">
        <h2 className="text-headline-sm font-headline-sm text-primary">
          Voca Intelligence
        </h2>
        <p className="text-caption text-mute mt-xs">
          Meeting Analysis Platform
        </p>
      </div>

      <nav className="flex flex-col gap-xs flex-1">
        {NAV.map(({ label, icon, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-md px-md py-sm rounded-lg transition-colors ${
                active
                  ? "bg-surface-container-highest text-primary"
                  : "text-mute hover:text-primary hover:bg-surface-container-high"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20 }}
              >
                {icon}
              </span>
              <span className="text-body-md font-body-md">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-md">
        <div className="bg-surface-deep border border-hairline p-md rounded-xl">
          <p className="text-caption text-mute mb-sm">Session active</p>
          <div className="flex items-center gap-sm">
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span className="text-caption text-accent-green font-code-md">
              Engine ready
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
