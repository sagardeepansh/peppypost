"use client";

import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }) {

  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    router.push("/login");
    router.refresh();
  };

  return (
    <div className=" bg-gray-950 text-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 hidden md:flex flex-col">
        <div className="p-4 text-lg font-semibold border-b border-gray-800">
          Dashboard
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <a
            href="/dashboard"
            className="block rounded px-3 py-2 text-sm hover:bg-gray-800"
          >
            Home
          </a>
          <a
            href="/dashboard/templates"
            className="block rounded px-3 py-2 text-sm hover:bg-gray-800"
          >
            Template
          </a>
          <a
            href="/dashboard/settings"
            className="block rounded px-3 py-2 text-sm hover:bg-gray-800"
          >
            Settings
          </a>
          <a
            href="/dashboard/log"
            className="block rounded px-3 py-2 text-sm hover:bg-gray-800"
          >
            Settings
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
          <h1 className="text-sm font-medium text-gray-200">
            Welcome
          </h1>

          <button
            onClick={handleLogout}
            className="text-sm text-gray-300 hover:text-white bg-gray-800 px-3 py-1.5 rounded-md border border-gray-700 hover:bg-gray-700 transition"
          >
            Logout
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  );
}
