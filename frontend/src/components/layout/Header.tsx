import { Menu } from "lucide-react";

import { getCurrentUser } from "../../auth/authStorage";

interface HeaderProps {
  onOpenSidebar: () => void;
}

export default function Header({ onOpenSidebar }: HeaderProps) {
  const currentUser = getCurrentUser();

  const initials = getInitials(
    currentUser?.fullName ?? currentUser?.username ?? "User",
  );

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Open sidebar"
          className="rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden"
          onClick={onOpenSidebar}
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

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">
            {currentUser?.fullName ?? currentUser?.username ?? "User"}
          </p>

          <p className="text-xs text-slate-500">
            {currentUser?.role.replaceAll("_", " ") ?? ""}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
          {initials}
        </div>
      </div>
    </header>
  );
}

function getInitials(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}
