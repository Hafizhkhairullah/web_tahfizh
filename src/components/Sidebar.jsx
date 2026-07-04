"use client";

import { useState } from "react";
import {
  Menu,
  X,
  BookCheck,
  BookOpen,
  UserPlus,
  LayoutDashboard,
} from "lucide-react";

export default function Sidebar({ children, session, isOpen }) {
  // HANYA UNTUK MOBILE
  const [openMobile, setOpenMobile] = useState(false);

  // MENU UNTUK GURU
  const menuGuru = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/", last: true },
    {
      name: "Data Hafalan",
      icon: BookOpen,
      href: "/guru/dashboard",
      last: true,
    },
    {
      name: "Progress Hafalan",
      icon: BookCheck,
      href: "/summary",
      last: false,
    },
  ];

  // MENU UNTUK WALISANTRI
  const menuWali = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/", last: true },
    {
      name: "Data Hafalan Anak",
      icon: BookOpen,
      href: "/walisantri/dashboard",
      last: false,
    },
  ];

  // MENU UNTUK ADMIN
  const menuAdmin = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/", last: true },
    {
      name: "Tambah Santri",
      icon: UserPlus,
      href: "/dashboard/tambah-santri",
      last: true,
    },
    { name: "Tambah Akun", icon: UserPlus, href: "/register", last: true },
  
  ];

  const getMenuByRole = () => {
    if (session?.user?.role === "GURU") return menuGuru;
    if (session?.user?.role === "WALISANTRI") return menuWali;
    if (session?.user?.role === "ADMIN") return menuAdmin;
    return [];
  };

  const currentMenu = getMenuByRole();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ================= MOBILE FLOAT BUTTON ================= */}
      <button
        onClick={() => setOpenMobile(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-30"
      >
        <Menu size={24} />
      </button>

      {/* ================= SIDEBAR DESKTOP ================= */}
      <aside
        className={`
          hidden md:block fixed top-0 left-0 h-screen bg-white border-r border-slate-200 shadow-sm
          transition-all duration-300 ease-in-out overflow-hidden
          ${isOpen ? "w-64 p-6" : "w-0 p-0"}
        `}
      >
        {isOpen && (
          <>
            <div className="mb-8 mt-2">
              <h2 className="text-xl font-bold text-slate-900">
                {session?.user?.role === "WALISANTRI"
                  ? "Wali Murid Panel"
                  : session?.user?.role === "ADMIN"
                    ? "Kordinator Panel"
                    : "Guru Panel"}
              </h2>
            </div>

            <nav className="flex flex-col gap-2">
              {currentMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition font-medium ${
                      item.last ? "border-b border-slate-200/50" : ""
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </a>
                );
              })}
            </nav>
          </>
        )}
      </aside>

      {/* ================= SIDEBAR MOBILE ================= */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl border-t z-50
          transition-transform duration-300
          ${openMobile ? "translate-y-0" : "translate-y-full"}
        `}
        style={{ maxHeight: "80vh" }}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="font-bold text-lg">
            {session?.user?.role === "WALISANTRI"
              ? "Wali Murid Panel"
              : session?.user?.role === "ADMIN"
                ? "Kordinator Panel"
                : "Guru Panel"}
          </h2>
          <button onClick={() => setOpenMobile(false)}>
            <X size={22} />
          </button>
        </div>

        <nav className="p-6 flex flex-col gap-2 overflow-y-auto">
          {currentMenu.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setOpenMobile(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 font-medium"
              >
                <Icon size={20} />
                {item.name}
              </a>
            );
          })}
        </nav>
      </div>

      {/* ================= OVERLAY MOBILE ================= */}
      {openMobile && (
        <div
          onClick={() => setOpenMobile(false)}
          className="fixed inset-0 bg-black/40 md:hidden z-40"
        />
      )}

      {/* ================= MAIN CONTENT ================= */}
      <main
        className={`
          flex-1 w-full p-2 md:p-6 mt-2 md:mt-8 transition-all duration-300
          ${isOpen ? "md:ml-64" : "md:ml-0"}
        `}
      >
        {children}
      </main>
    </div>
  );
}
