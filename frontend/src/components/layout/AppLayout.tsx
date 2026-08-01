import {
  CirclePlus,
  LayoutDashboard,
  Menu,
  Settings,
  TicketCheck,
  TrainFront,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const navigationItems = [
  {
    label: "Dashboard",
    to: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Issues",
    to: "/issues",
    icon: TicketCheck,
  },
  {
    label: "Create issue",
    to: "/issues/new",
    icon: CirclePlus,
  },
  {
    label: "Settings",
    to: "/settings",
    icon: Settings,
  },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-white transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <NavLink
            to="/"
            onClick={closeSidebar}
            className="flex items-center gap-3"
          >
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
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden"
            onClick={closeSidebar}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={closeSidebar}
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

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="text-sm text-slate-500">Transport operations</p>
              <h1 className="font-semibold text-slate-900">
                Service Issue Tracker
              </h1>
            </div>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            RP
          </div>
        </header>

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
