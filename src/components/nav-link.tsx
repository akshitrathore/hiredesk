"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, CalendarDays, LayoutDashboard } from "lucide-react";

type NavLinkProps = {
  href: string;
  icon: "dashboard" | "jobs" | "interviews";
  label: string;
};

export function NavLink({ href, icon: Icon, label }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  const Icons = {
    dashboard: LayoutDashboard,
    jobs: BriefcaseBusiness,
    interviews: CalendarDays,
  };
  const IconComponent = Icons[Icon];

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        isActive
          ? "bg-foreground text-white shadow-sm"
          : "text-muted hover:bg-background hover:text-foreground"
      }`}
      href={href}
    >
      <IconComponent
        aria-hidden="true"
        className={
          isActive ? "text-white" : "text-muted group-hover:text-foreground"
        }
        size={17}
        strokeWidth={2}
      />
      {label}
    </Link>
  );
}
