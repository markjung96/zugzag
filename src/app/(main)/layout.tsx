"use client";

import { motion } from "framer-motion";
import { Home, Users, Calendar, User, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ToastProvider } from "@/components/toast-provider";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: currentUserData } = useCurrentUser();

  const user = currentUserData?.user;
  const profile = currentUserData?.profile;

  const navigation = [
    { name: "대시보드", href: "/dashboard", icon: Home },
    { name: "크루", href: "/crews", icon: Users },
    { name: "일정", href: "/schedules", icon: Calendar },
    { name: "프로필", href: "/profile", icon: User },
  ];

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-zinc-950">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 border-r border-zinc-800 bg-zinc-900/50 backdrop-blur-xl lg:flex lg:flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-6">
            <motion.img
              src="/zugzag-logo.png"
              alt="ZUGZAG"
              className="h-6 w-auto"
              whileHover={{ scale: 1.05 }}
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-gradient-to-r from-orange-500/10 to-cyan-400/10 text-white"
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "text-orange-500" : ""}`} />
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="ml-auto h-2 w-2 rounded-full bg-orange-500"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-zinc-800 p-4">
            <Link href="/profile">
              <div className="flex items-center gap-3 rounded-xl bg-zinc-800/50 px-4 py-3 transition-colors hover:bg-zinc-800">
                {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                      alt={profile?.nickname || profile?.full_name || "사용자"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-cyan-400">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-white">
                    {profile?.nickname ||
                      profile?.full_name ||
                      user?.user_metadata?.full_name ||
                      "크루원"}
                  </p>
                  <p className="truncate text-xs text-zinc-400">
                    {user?.email || "guest@zugzag.com"}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <motion.aside
          initial={{ x: "-100%" }}
          animate={{ x: isSidebarOpen ? 0 : "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-800 bg-zinc-900 backdrop-blur-xl lg:hidden"
        >
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-6">
            <div className="flex items-center gap-3">
              <motion.img
                src="/zugzag-logo.png"
                alt="ZUGZAG"
                className="h-6 w-auto"
                whileHover={{ scale: 1.05 }}
              />
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href} onClick={() => setIsSidebarOpen(false)}>
                  <motion.div
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-gradient-to-r from-orange-500/10 to-cyan-400/10 text-white"
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "text-orange-500" : ""}`} />
                    {item.name}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* User Section - Mobile */}
          <div className="border-t border-zinc-800 p-4">
            <Link href="/profile" onClick={() => setIsSidebarOpen(false)}>
              <div className="flex items-center gap-3 rounded-xl bg-zinc-800/50 px-4 py-3 transition-colors hover:bg-zinc-800">
                {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                      alt={profile?.nickname || profile?.full_name || "사용자"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-cyan-400">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-white">
                    {profile?.nickname ||
                      profile?.full_name ||
                      user?.user_metadata?.full_name ||
                      "크루원"}
                  </p>
                  <p className="truncate text-xs text-zinc-400">
                    {user?.email || "guest@zugzag.com"}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 backdrop-blur-xl lg:hidden">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
            <motion.img
              src="/zugzag-logo.png"
              alt="ZUGZAG"
              className="h-6 w-auto"
              whileHover={{ scale: 1.05 }}
            />
            <div className="w-10" /> {/* Spacer for centering */}
          </header>

          {/* Desktop Header */}
          <header className="hidden h-16 items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-8 backdrop-blur-xl lg:flex">
            <div>
              <h1 className="text-xl font-bold text-white">
                {navigation.find((item) => item.href === pathname)?.name || "ZUGZAG"}
              </h1>
              <p className="text-sm text-zinc-400">함께 오르는 즐거움</p>
            </div>
            <div className="flex items-center gap-4">
              <motion.button
                className="rounded-xl border border-zinc-800 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                알림
              </motion.button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="h-full">{children}</div>
          </main>

          {/* Mobile Bottom Navigation */}
          <nav className="flex h-16 items-center justify-around border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-xl lg:hidden">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href} className="flex-1">
                  <motion.div
                    className="flex flex-col items-center justify-center gap-1 py-2"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon className={`h-6 w-6 ${isActive ? "text-orange-500" : "text-zinc-400"}`} />
                    <span
                      className={`text-xs font-medium ${
                        isActive ? "text-orange-500" : "text-zinc-400"
                      }`}
                    >
                      {item.name}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeMobile"
                        className="absolute bottom-0 h-1 w-12 rounded-t-full bg-orange-500"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </ToastProvider>
  );
}
