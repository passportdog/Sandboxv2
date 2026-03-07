"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

const NAV_ITEMS = [
  { icon: "solar:home-angle-linear",     label: "Dashboard",   href: "/"           },
  { icon: "solar:import-linear",         label: "Import",      href: "/import"     },
  { icon: "solar:widget-linear",         label: "Endpoints",   href: "/endpoints"  },
  { icon: "solar:play-circle-linear",    label: "Runs",        href: "/runs"       },
  { icon: "solar:cpu-linear",            label: "Models",      href: "/models"     },
  { icon: "solar:puzzle-linear",         label: "Node Packs",  href: "/node-packs" },
  { icon: "solar:server-square-linear",  label: "Pods",        href: "/pods"       },
  { icon: "solar:camera-linear",         label: "Snapshots",   href: "/snapshots"  },
];

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Desktop left icon rail */}
      <aside className="hidden lg:flex w-24 flex-col items-center justify-center h-full z-40 shrink-0 pointer-events-none relative">
        <div className="pointer-events-auto flex flex-col gap-3 bg-white/70 backdrop-blur-xl border border-neutral-200/50 rounded-full p-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all hover:bg-white/90">
          {/* Branding */}
          <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white mb-2 shadow-sm cursor-pointer hover:bg-neutral-800 transition-colors">
            <span className="text-xs font-medium tracking-tighter">SB</span>
          </div>

          <div className="w-full h-px bg-neutral-200/50 mb-1" />

          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} className="relative group">
                <div
                  className={`grid place-items-center w-10 h-10 rounded-full transition-all cursor-pointer ${
                    active
                      ? "bg-neutral-100 text-neutral-900 shadow-sm border border-neutral-200/50"
                      : "text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100/80"
                  }`}
                >
                  <Icon icon={item.icon} width={20} height={20} />
                </div>
                {/* Tooltip */}
                <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-neutral-900 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-geist-mono shadow-sm z-50">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 w-full h-16 bg-white/80 backdrop-blur-md border-t border-neutral-200 flex items-center justify-around z-50 px-2">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex flex-col items-center justify-center w-12 h-12 relative transition-colors ${
                  active ? "text-neutral-900" : "text-neutral-400"
                }`}
              >
                <Icon icon={item.icon} width={22} height={22} />
                {active && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-neutral-900" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
