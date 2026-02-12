"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Users, Globe } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    {
      name: "Simulateur Règlements",
      path: "/simulateur",
      icon: FileText,
    },
    { name: "Matrice Délégation", path: "/simulateur/delegation", icon: Users },
    {
      name: "Importation LCI",
      path: "/simulateur/simulateur_lci",
      icon: Globe,
    },
  ];

  return (
    <nav className="bg-white text-[#0e3b6e] shadow-md sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* LOGO & MARQUE */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="Wifak Bank Logo"
                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
              />

              <div className="flex flex-col leading-none">
                <span className="font-bold text-lg tracking-tight text-[#0e3b6e]">
                  WIFAK BANK
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 group-hover:text-[#be1e2d] transition-colors">
                  Digital Factory
                </span>
              </div>
            </Link>
          </div>

          {/* LIENS DE NAVIGATION */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
                    ${
                      active
                        ? "bg-[#be1e2d] text-white border-[#be1e2d] shadow-md"
                        : "bg-white text-slate-600 border-transparent hover:bg-slate-50 hover:text-[#0e3b6e]"
                    }
                  `}
                >
                  <Icon size={18} />
                  <span className="hidden md:inline">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
