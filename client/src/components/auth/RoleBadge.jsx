/**
 * RoleBadge.jsx
 * Small colored pill badge for displaying user roles.
 */

import React from "react";
import { ShieldCheck, User, Building2, ClipboardCheck, Crown } from "lucide-react";

const ROLE_CONFIG = {
  guest: {
    label: "Guest",
    icon: User,
    className: "bg-gray-100 text-gray-600 border-gray-200"
  },
  user: {
    label: "Patient",
    icon: User,
    className: "bg-blue-50 text-blue-700 border-blue-200"
  },
  hospital_admin: {
    label: "Hospital Admin",
    icon: Building2,
    className: "bg-amber-50 text-amber-700 border-amber-200"
  },
  verifier: {
    label: "Data Verifier",
    icon: ClipboardCheck,
    className: "bg-teal-50 text-teal-700 border-teal-200"
  },
  platform_admin: {
    label: "Platform Admin",
    icon: Crown,
    className: "bg-purple-50 text-purple-700 border-purple-200"
  }
};

export default function RoleBadge({ role, size = "sm" }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.guest;
  const Icon = config.icon;

  const sizeClass = size === "xs"
    ? "text-[10px] px-1.5 py-0.5 gap-1"
    : "text-xs px-2 py-0.5 gap-1.5";

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${config.className} ${sizeClass}`}>
      <Icon className={size === "xs" ? "w-2.5 h-2.5" : "w-3 h-3"} />
      {config.label}
    </span>
  );
}
