"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Upload", href: "/upload" },
  { label: "Results", href: "/results" },
  { label: "Ask Voca", href: "/chat" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-xxl h-20 bg-canvas border-b border-hairline-strong backdrop-blur-sm">
      <div className="flex items-center gap-md">
        <Link
          href="/"
          className="text-primary tracking-tighter leading-none"
          style={{ fontFamily: "var(--font-noto-serif)", fontSize: 28 }}
        >
          Voca
        </Link>
      </div>

      <nav className="hidden md:flex gap-xl">
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`text-body-sm font-body-sm hover:opacity-80 transition-opacity ${
              pathname === href
                ? "text-primary font-bold"
                : "text-on-surface-variant"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
