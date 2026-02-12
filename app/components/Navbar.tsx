"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Users,
  Globe,
  ChevronDown,
  Sparkles,
  ArrowRight,
} from "lucide-react";

/**
 * COMPOSANT NAVBAR WIFAK BANK
 * Mise à jour : "Simulation Règlement" est désormais un lien direct.
 * Le dropdown "Nouveautés" contient les autres outils.
 */
export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pathname, setPathname] = useState("");

  // Initialisation du chemin actuel pour l'état actif
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname);
    }
  }, []);

  // Vérifie si un des sous-liens du dropdown est actif
  const isDropdownChildActive = () => {
    return ["/simulateur/delegation", "/simulateur/simulateur_lci"].includes(
      pathname,
    );
  };

  // Liste des items restant dans le menu déroulant
  const dropdownItems = [
    {
      name: "Matrice Délégation",
      path: "/simulateur/delegation",
      icon: Users,
      description: "Pouvoirs de signature 2026",
    },
    {
      name: "Importation LCI",
      path: "/simulateur/simulateur_lci",
      icon: Globe,
      description: "Gestion des crédits documentaires",
    },
  ];

  return (
    <nav className="bg-white text-[#0e3b6e] shadow-md sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* LOGO & MARQUE */}
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-3 group">
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
            </a>
          </div>

          {/* NAVIGATION DROITE */}
          <div className="flex items-center space-x-2">
            {/* LIEN DIRECT : SIMULATION RÈGLEMENT */}
            <a
              href="/simulateur"
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 border
                ${
                  pathname === "/simulateur"
                    ? "bg-[#be1e2d] text-white border-[#be1e2d] shadow-md"
                    : "text-slate-600 border-transparent hover:bg-slate-50 hover:text-[#0e3b6e]"
                }
              `}
            >
              <FileText size={18} />
              <span className="hidden md:inline">Simulation Règlement</span>
            </a>

            {/* MENU DÉROULANT NOUVEAUTÉS */}
            <div
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 border
                  ${
                    isDropdownChildActive()
                      ? "bg-[#0e3b6e] text-white shadow-md border-[#0e3b6e]"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }
                `}
              >
                <Sparkles
                  size={16}
                  className={
                    isDropdownChildActive()
                      ? "text-yellow-400"
                      : "text-[#be1e2d]"
                  }
                />
                <span>Nouveautés</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* LISTE DÉROULANTE */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-0 w-72 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-50 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                      Autres Simulateurs
                    </span>
                  </div>

                  {dropdownItems.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.path;

                    return (
                      <a
                        key={item.path}
                        href={item.path}
                        className={`
                          flex items-start gap-3 px-4 py-3 transition-colors
                          ${
                            active
                              ? "bg-red-50 text-[#be1e2d]"
                              : "hover:bg-slate-50 text-slate-700"
                          }
                        `}
                      >
                        <div
                          className={`p-2 rounded-lg ${active ? "bg-[#be1e2d] text-white" : "bg-slate-100 text-[#0e3b6e]"}`}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold leading-none mb-1">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {item.description}
                          </span>
                        </div>
                        {active && (
                          <ArrowRight size={14} className="ml-auto mt-1" />
                        )}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ACCUEIL */}
            <a
              href="/"
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${pathname === "/" ? "text-[#be1e2d]" : "text-slate-500 hover:text-[#0e3b6e]"}`}
            >
              Accueil
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
