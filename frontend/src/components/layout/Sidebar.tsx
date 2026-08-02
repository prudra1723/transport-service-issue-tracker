import {
  CirclePlus,
  LayoutDashboard,
  Settings,
  TicketCheck,
  TrainFront,
  Users,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { getCurrentUser } from "../../auth/authStorage";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const currentUser = getCurrentUser();

  const navigationItems = [
    {
      label: "Dashboard",
      to: "/",
      icon: LayoutDashboard,
      adminOnly: false,
    },
    {
      label: "Issues",
      to: "/issues",
      icon: TicketCheck,
      adminOnly: false,
    },
    {
      label: "Create issue",
      to: "/issues/new",
      icon: CirclePlus,
      adminOnly: false,
    },
    {
      label: "Users",
      to: "/users",
      icon: Users,
      adminOnly: true,
    },
    {
      label: "Settings",
      to: "/settings",
      icon: Settings,
      adminOnly: false,
    },
  ];

  const visibleNavigationItems = navigationItems.filter(
    (item) => !item.adminOnly || currentUser?.role === "ADMIN",
  );

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-white transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <NavLink to="/" onClick={onClose} className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
              <TrainFront size={24} />
            </span>

            <span>
              <span className="block text-sm font-semibold">
                Nexus Transport
              </span>

              <span className="block text-xs text-slate-400">
                Issue Tracker
              </span>
            </span>
          </NavLink>

          <button
            type="button"
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {visibleNavigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-white/10 hover:text-white",
                  ].join(" ")
                }
              >
                <Icon size={20} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-5">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-sm font-medium">System status</p>

            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Backend connected
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
