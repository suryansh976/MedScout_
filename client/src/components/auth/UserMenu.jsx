import React, { useState } from "react";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import RoleBadge from "./RoleBadge.jsx";

export default function UserMenu({ onOpenProfile }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const initials = user?.name?.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase() || "MS";

  return (
    <div className="relative">
      <button onClick={() => setOpen(value => !value)} className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-2 py-1.5 text-left" aria-expanded={open}>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{initials}</span>
        <span className="hidden max-w-[120px] sm:block">
          <span className="block truncate text-xs font-semibold text-on-surface">{user?.name}</span>
          <span className="block truncate text-[10px] text-tertiary">{user?.email}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-tertiary" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-[100] w-64 rounded-xl border border-surface-container-high bg-white p-3 shadow-xl">
          <div className="mb-3 border-b border-surface-container-high pb-3">
            <RoleBadge role={user?.role} size="xs" />
          </div>
          <button onClick={() => { setOpen(false); onOpenProfile?.(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-on-surface hover:bg-surface-container-low">
            <UserRound className="h-4 w-4 text-primary" /> Profile & saved items
          </button>
          <button onClick={() => { setOpen(false); logout(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-red-50">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
