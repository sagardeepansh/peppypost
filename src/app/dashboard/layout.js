"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Activity,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  {
    label: "Home",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Templates",
    href: "/dashboard/templates",
    icon: FileText,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    label: "Logs",
    href: "/dashboard/logs",
    icon: Activity,
  },
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 flex">
      {/* ================= MOBILE OVERLAY ================= */}
      <div
        className={`fixed inset-0 z-40 md:hidden bg-black/60
        transition-opacity duration-300 ease-out
        ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ================= MOBILE SIDEBAR ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/95 backdrop-blur-xl border-r border-white/10
        transform transition-all duration-300 ease-out md:hidden
        ${
          mobileOpen
            ? "translate-x-0 opacity-100 scale-100"
            : "-translate-x-full opacity-0 scale-95"
        }`}
      >
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <button
            onClick={() => setMobileOpen(false)}
            className="transition-transform duration-200 hover:rotate-90"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Nav */}
        <nav className="px-4 py-6 space-y-1">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                style={{ transitionDelay: `${index * 40}ms` }}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm
                  transition-all duration-300
                  ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }
                  ${
                    mobileOpen
                      ? "translate-x-0 opacity-100"
                      : "translate-x-2 opacity-0"
                  }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-500/10 text-red-400 px-3 py-2 text-sm hover:bg-red-500/20 transition"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/10 bg-gray-900/60 backdrop-blur-xl">
        <div className="h-16 px-6 flex items-center border-b border-white/10">
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition
                  ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:flex">{item.label}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-500/10 text-red-400 px-3 py-2 text-sm hover:bg-red-500/20 transition"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:flex">Logout</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-gray-900/60 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-gray-300 hover:text-white transition-transform duration-200 active:scale-95"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div>
              <h2 className="text-sm text-gray-400">Welcome back</h2>
              <p className="text-base font-medium text-white">
                Dashboard Overview
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-0 sm:p-6">
          <div className="rounded-xl border border-white/10 bg-gray-900/40 backdrop-blur-xl p-6 shadow-xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
