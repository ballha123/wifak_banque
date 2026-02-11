"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  User,
  Key,
  ArrowRight,
  CheckCircle,
  FileText,
  ShieldCheck,
  Globe,
  Ship,
  Anchor,
  TrendingUp,
  Users,
  Laptop,
  Lock,
  LayoutTemplate,
  Maximize2,
  X,
  ChevronRight,
  ChevronLeft,
  Target,
  List,
} from "lucide-react";

export default function PresentationGenerator() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const slides = [
    { id: 0, title: "Introduction", type: "intro" },
    { id: 1, title: "1. Définition IJARA", type: "concept" },
    { id: 2, title: "2. Processus Règlement", type: "process" },
    { id: 3, title: "3. Matrice Délégation", type: "delegation" },
    { id: 4, title: "4. Import LCI", type: "lci" },
    { id: 5, title: "Conclusion", type: "conclusion" },
  ];

  // Gestion Clavier
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Escape") {
        setIsFullScreen(false);
      }
    },
    [slides.length],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Styles spécifiques Wifak (Background)
  const WifakBackground = ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) => (
    <div className="w-full h-full relative overflow-hidden bg-[#0e3b6e] text-white flex flex-col">
      {/* Forme Rouge (Haut Droite) */}
      <div
        className="absolute top-0 right-0 w-[40%] h-[60%] bg-[#be1e2d] z-0"
        style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
      ></div>

      {/* Forme Grise/Blanche (Bas Droite) */}
      <div
        className="absolute bottom-0 right-0 w-[30%] h-[25%] bg-white z-10"
        style={{ clipPath: "polygon(100% 0, 0% 100%, 100% 100%)" }}
      ></div>
      <div
        className="absolute bottom-0 right-0 w-[35%] h-[30%] bg-slate-400/50 z-0"
        style={{ clipPath: "polygon(100% 0, 0% 100%, 100% 100%)" }}
      ></div>

      {/* LOGO Wifak (Bas Droite) */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <div className="text-[#0e3b6e] font-bold text-2xl tracking-tighter flex flex-col items-end leading-none">
          <span>WIFAK BANK</span>
          <span className="text-[10px] uppercase tracking-widest">
            بنك الوفاق
          </span>
        </div>
        <div className="w-10 h-10 bg-[#be1e2d] rounded-tl-xl rounded-br-xl"></div>
      </div>

      {/* Header Slide */}
      <div className="relative z-20 pt-12 px-16">
        <h2 className="text-4xl font-bold border-b-4 border-[#be1e2d] pb-4 inline-block mb-2">
          {title || "Titre de la diapositive"}
        </h2>
      </div>

      {/* Contenu Principal */}
      <div className="relative z-20 flex-1 px-16 py-8 overflow-hidden">
        {children}
      </div>

      {/* Footer */}
      <div className="relative z-20 pb-4 px-16 flex justify-between items-end text-sm text-slate-300">
        <div>Réalisé par : Ingénieur Informatique</div>
        <div className="mr-48">www.wifakbank.com</div>
      </div>
    </div>
  );

  return (
    <div
      className={`font-sans bg-slate-100 flex flex-col items-center justify-center transition-all duration-300 ${isFullScreen ? "fixed inset-0 z-50 bg-black" : "min-h-screen p-8"}`}
    >
      {/* Contrôles (Masqués en plein écran sauf au survol) */}
      {!isFullScreen && (
        <div className="bg-white p-4 rounded-xl shadow-sm mb-8 flex gap-4 items-center max-w-full overflow-x-auto w-[960px] justify-between">
          <div className="flex gap-2">
            {slides.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all
                  ${
                    currentSlide === idx
                      ? "bg-[#0e3b6e] text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
              >
                {slide.title}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsFullScreen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-[#be1e2d] text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg animate-pulse"
          >
            <Maximize2 size={18} /> Lancer le Diaporama
          </button>
        </div>
      )}

      {/* Bouton Fermer (Plein écran uniquement) */}
      {isFullScreen && (
        <button
          onClick={() => setIsFullScreen(false)}
          className="absolute top-4 left-4 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-black/80"
        >
          <X size={24} />
        </button>
      )}

      {/* CONTENEUR PRINCIPAL */}
      <div
        className={`relative overflow-hidden bg-white shadow-2xl transition-all duration-500
        ${isFullScreen ? "w-screen h-screen rounded-none" : "w-[960px] h-[540px] rounded-xl border border-slate-200"}`}
      >
        {/* --- SLIDE 0: INTRODUCTION --- */}
        {currentSlide === 0 && (
          <WifakBackground title="Introduction & Contexte">
            <div className="h-full flex gap-12 items-center">
              {/* Colonne Gauche: Contexte Stratégique */}
              <div className="flex-1 space-y-6">
                <div className="bg-white/10 p-8 rounded-xl border border-white/20 shadow-lg backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-[#be1e2d] mb-6 flex items-center gap-3">
                    <Target size={28} /> Objectifs Stratégiques
                  </h3>
                  <ul className="space-y-6 text-slate-100 text-lg">
                    <li className="flex items-start gap-4">
                      <div className="mt-2 min-w-[8px] h-[8px] rounded-full bg-white shadow-[0_0_10px_white]"></div>
                      <div>
                        <strong className="block text-xl mb-1">
                          Efficacité Opérationnelle
                        </strong>
                        <span className="text-slate-300 text-sm">
                          Réduction des délais de traitement et optimisation des
                          flux (Note NO-2026).
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="mt-2 min-w-[8px] h-[8px] rounded-full bg-white shadow-[0_0_10px_white]"></div>
                      <div>
                        <strong className="block text-xl mb-1">
                          Sécurité & Conformité
                        </strong>
                        <span className="text-slate-300 text-sm">
                          Digitalisation des contrôles (PROLEASE, SWIFT) et
                          respect Sharia.
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="mt-2 min-w-[8px] h-[8px] rounded-full bg-white shadow-[0_0_10px_white]"></div>
                      <div>
                        <strong className="block text-xl mb-1">
                          Agilité Décisionnelle
                        </strong>
                        <span className="text-slate-300 text-sm">
                          Nouvelle matrice de délégation décentralisée pour plus
                          de réactivité.
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Colonne Droite: Agenda */}
              <div className="flex-1 h-full flex flex-col justify-center pl-8 border-l border-white/10">
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                  <List size={28} /> Ordre du Jour
                </h3>
                <div className="space-y-4 relative">
                  {/* Ligne Timeline */}
                  <div className="absolute left-[19px] top-6 bottom-6 w-[2px] bg-white/20"></div>

                  {[
                    "Définition du Règlement IJARA",
                    "Processus & Workflow",
                    "Matrice de Délégation 2026",
                    "Importation LCI (Trade Finance)",
                    "Démonstration & Conclusion",
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-6 relative z-10 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#0e3b6e] border-2 border-[#be1e2d] flex items-center justify-center text-sm font-bold shadow-lg group-hover:scale-110 transition-transform">
                        {idx + 1}
                      </div>
                      <div className="bg-white/5 px-6 py-3 rounded-lg w-full border border-white/5 text-base text-slate-200 group-hover:bg-white/10 group-hover:pl-8 transition-all">
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </WifakBackground>
        )}

        {/* --- SLIDE 1: DÉFINITION IJARA --- */}
        {currentSlide === 1 && (
          <WifakBackground title="1. Le Mécanisme IJARA">
            <div className="h-full flex flex-col justify-center items-center">
              <div className="flex items-center gap-12 w-full justify-center mt-[-20px]">
                {/* Banque */}
                <div className="flex flex-col items-center gap-4 animate-in slide-in-from-left duration-700">
                  <div className="w-28 h-28 bg-white/10 backdrop-blur rounded-full flex items-center justify-center border-2 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    <Building2 size={48} className="text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-xl">WIFAK BANK</div>
                    <div className="text-sm text-slate-300">
                      Propriétaire (Bailleur)
                    </div>
                  </div>
                </div>

                {/* Flux Central */}
                <div className="flex flex-col gap-8 relative w-64">
                  <div className="flex items-center gap-2 text-white">
                    <div className="flex-1 h-[2px] bg-white/30"></div>
                    <div className="bg-[#be1e2d] px-3 py-1 rounded text-xs font-bold uppercase">
                      1. Achat
                    </div>
                    <div className="flex-1 h-[2px] bg-white/30 relative">
                      <ArrowRight
                        size={14}
                        className="absolute right-0 top-1/2 -translate-y-1/2"
                      />
                    </div>
                  </div>

                  <div className="w-32 h-32 bg-gradient-to-br from-[#be1e2d] to-pink-600 rounded-2xl shadow-2xl flex items-center justify-center mx-auto transform hover:scale-110 transition-transform cursor-pointer border-4 border-white/20">
                    <Key size={56} className="text-white drop-shadow-md" />
                  </div>

                  <div className="flex items-center gap-2 text-white flex-row-reverse">
                    <div className="flex-1 h-[2px] bg-white/30"></div>
                    <div className="bg-sky-500 px-3 py-1 rounded text-xs font-bold uppercase">
                      2. Loyers
                    </div>
                    <div className="flex-1 h-[2px] bg-white/30 relative">
                      <ArrowRight
                        size={14}
                        className="absolute left-0 top-1/2 -translate-y-1/2 rotate-180"
                      />
                    </div>
                  </div>
                </div>

                {/* Client */}
                <div className="flex flex-col items-center gap-4 animate-in slide-in-from-right duration-700">
                  <div className="w-28 h-28 bg-white/10 backdrop-blur rounded-full flex items-center justify-center border-2 border-white/20">
                    <User size={48} className="text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-xl">CLIENT</div>
                    <div className="text-sm text-slate-300">Locataire</div>
                  </div>
                </div>
              </div>

              <div className="mt-12 bg-white/10 px-8 py-3 rounded-full border border-white/20 text-sm font-medium text-slate-200 animate-in fade-in duration-1000 delay-300">
                Transfert de propriété en fin de contrat (Promesse de Vente)
              </div>
            </div>
          </WifakBackground>
        )}

        {/* --- SLIDE 2: PROCESSUS RÈGLEMENT --- */}
        {currentSlide === 2 && (
          <WifakBackground title="2. Workflow Règlement">
            <div className="h-full flex flex-col justify-center">
              <div className="grid grid-cols-4 gap-6">
                {[
                  {
                    step: "01",
                    title: "Agence",
                    desc: "Collecte & Scan Dossier",
                    icon: FileText,
                    delay: "0",
                  },
                  {
                    step: "02",
                    title: "Middle Office",
                    desc: "Contrôle Exhaustivité",
                    icon: ShieldCheck,
                    delay: "100",
                  },
                  {
                    step: "03",
                    title: "BO Trésorerie",
                    desc: "Ordre Décaissement",
                    icon: LayoutTemplate,
                    delay: "200",
                  },
                  {
                    step: "04",
                    title: "Validation",
                    desc: "Signature & Paiement",
                    icon: CheckCircle,
                    delay: "300",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`relative bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col justify-between h-56 hover:bg-white/10 transition-colors animate-in zoom-in-50 duration-500`}
                    style={{ animationDelay: `${item.delay}ms` }}
                  >
                    <div className="absolute top-4 right-4 text-4xl font-bold text-white/5">
                      {item.step}
                    </div>
                    <div className="w-12 h-12 bg-[#be1e2d] rounded-lg flex items-center justify-center mb-4 shadow-lg">
                      <item.icon className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-300">{item.desc}</p>
                    </div>
                    {idx < 3 && (
                      <div className="absolute -right-7 top-1/2 -translate-y-1/2 text-white/30">
                        <ArrowRight size={24} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-10 flex gap-6">
                <div className="flex-1 bg-gradient-to-r from-amber-500/20 to-transparent p-4 rounded-lg border-l-4 border-amber-500 flex items-center gap-4">
                  <div className="bg-amber-500 p-2 rounded text-white font-bold">
                    !
                  </div>
                  <div>
                    <div className="font-bold text-amber-400">
                      Contrôle PROLEASE Intégré
                    </div>
                    <div className="text-xs text-amber-100">
                      Vérification automatique scoring/impayés avant tout
                      paiement.
                    </div>
                  </div>
                </div>
                <div className="flex-1 bg-gradient-to-r from-sky-500/20 to-transparent p-4 rounded-lg border-l-4 border-sky-500 flex items-center gap-4">
                  <div className="bg-sky-500 p-2 rounded text-white">
                    <Laptop size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-sky-400">100% Digital</div>
                    <div className="text-xs text-sky-100">
                      Zéro papier entre les services (GED).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </WifakBackground>
        )}

        {/* --- SLIDE 3: MATRICE DE DÉLÉGATION --- */}
        {currentSlide === 3 && (
          <WifakBackground title="3. Matrice de Délégation 2026">
            <div className="h-full flex items-center gap-12">
              <div className="flex-1 space-y-8">
                <div className="bg-white/10 p-6 rounded-xl border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Critères d'Escalade Automatique
                  </h3>
                  <ul className="space-y-3 text-slate-200 text-sm">
                    <li className="flex items-center gap-3">
                      <CheckCircle size={16} className="text-green-400" />{" "}
                      Montant du financement
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle size={16} className="text-green-400" />{" "}
                      Classe de Risque BCT (0, 1, 2)
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle size={16} className="text-green-400" /> Type
                      de Matériel (Spécifique vs Standard)
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle size={16} className="text-green-400" /> Taux
                      appliqué & Apport Client
                    </li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <div className="bg-blue-600/30 p-4 rounded border border-blue-500/50 flex-1">
                    <div className="text-xs text-blue-200 uppercase font-bold">
                      Objectif
                    </div>
                    <div className="font-bold">Décentralisation</div>
                    <div className="text-xs">Vers Agence (DA)</div>
                  </div>
                  <div className="bg-red-600/30 p-4 rounded border border-red-500/50 flex-1">
                    <div className="text-xs text-red-200 uppercase font-bold">
                      Sécurité
                    </div>
                    <div className="font-bold">Maîtrise Risque</div>
                    <div className="text-xs">Vers Siège (CPR)</div>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col-reverse items-center justify-end h-full pt-8">
                {/* Pyramide Inversée Visuellement pour le code mais droit pour l'oeil */}
                <div className="w-full bg-[#be1e2d] text-white py-3 px-6 rounded mb-1 text-center font-bold shadow-lg transform scale-105 border border-white/20">
                  COMITÉ / DG{" "}
                  <span className="text-xs font-normal block opacity-80">
                    &gt; 800 kDT
                  </span>
                </div>
                <div className="w-[90%] bg-purple-600 text-white py-3 px-6 rounded mb-1 text-center font-bold shadow-lg border border-white/20 opacity-90">
                  DGA / RISQUES{" "}
                  <span className="text-xs font-normal block opacity-80">
                    650 - 800 kDT
                  </span>
                </div>
                <div className="w-[80%] bg-emerald-600 text-white py-3 px-6 rounded mb-1 text-center font-bold shadow-lg border border-white/20 opacity-80">
                  PÔLE COMMERCIAL{" "}
                  <span className="text-xs font-normal block opacity-80">
                    200 - 300 kDT
                  </span>
                </div>
                <div className="w-[70%] bg-indigo-500 text-white py-3 px-6 rounded mb-1 text-center font-bold shadow-lg border border-white/20 opacity-70">
                  DIRECTEUR ZONE{" "}
                  <span className="text-xs font-normal block opacity-80">
                    100 - 200 kDT
                  </span>
                </div>
                <div className="w-[60%] bg-blue-500 text-white py-3 px-6 rounded mb-1 text-center font-bold shadow-lg border border-white/20 opacity-60">
                  AGENCE{" "}
                  <span className="text-xs font-normal block opacity-80">
                    &lt; 100 kDT
                  </span>
                </div>
              </div>
            </div>
          </WifakBackground>
        )}

        {/* --- SLIDE 4: IMPORT LCI --- */}
        {currentSlide === 4 && (
          <WifakBackground title="4. Import LCI (Swift)">
            <div className="h-full flex flex-col justify-center relative">
              <div className="flex justify-between items-center relative z-10 px-8">
                {/* Fournisseur */}
                <div className="text-center group">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/30 mb-4 group-hover:bg-[#be1e2d] transition-colors">
                    <Building2 size={32} className="text-white" />
                  </div>
                  <div className="font-bold text-lg">Fournisseur</div>
                  <div className="text-xs text-slate-300">Étranger</div>
                </div>

                {/* Flux 1 */}
                <div className="flex-1 border-t-2 border-dashed border-white/30 relative mx-4">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0e3b6e] px-2 text-xs text-sky-400 font-bold flex gap-1">
                    <Ship size={14} /> CIF / FOB
                  </div>
                  <ArrowRight
                    className="absolute -right-2 -top-3 text-white/30"
                    size={20}
                  />
                </div>

                {/* Wifak Trade */}
                <div className="text-center relative">
                  <div className="absolute -inset-4 bg-sky-500/20 rounded-full blur-xl"></div>
                  <div className="w-32 h-32 bg-sky-600 rounded-full flex items-center justify-center border-4 border-white/20 mb-4 relative z-10 shadow-[0_0_30px_rgba(14,165,233,0.4)]">
                    <Globe
                      size={48}
                      className="text-white animate-pulse-slow"
                    />
                  </div>
                  <div className="font-bold text-lg text-sky-300">
                    WIFAK TRADE
                  </div>
                  <div className="text-xs text-slate-300">Émission MT700</div>
                </div>

                {/* Flux 2 */}
                <div className="flex-1 border-t-2 border-dashed border-white/30 relative mx-4">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0e3b6e] px-2 text-xs text-emerald-400 font-bold">
                    Dédouanement
                  </div>
                  <ArrowRight
                    className="absolute -right-2 -top-3 text-white/30"
                    size={20}
                  />
                </div>

                {/* Client */}
                <div className="text-center group">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/30 mb-4 group-hover:bg-emerald-600 transition-colors">
                    <User size={32} className="text-white" />
                  </div>
                  <div className="font-bold text-lg">Client</div>
                  <div className="text-xs text-slate-300">Tunisie</div>
                </div>
              </div>

              {/* Terminal SWIFT */}
              <div className="mt-12 mx-auto w-2/3 bg-black/40 backdrop-blur rounded-lg border border-white/10 p-4 font-mono text-xs text-green-400 shadow-2xl">
                <div className="flex gap-2 mb-2 border-b border-white/10 pb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-auto text-slate-500">SWIFT NETWORK</span>
                </div>
                <p>&gt; CONNECTING TO GATEWAY...</p>
                <p>
                  &gt; SENDING MT700...{" "}
                  <span className="text-white">SUCCESS</span>
                </p>
                <p>&gt; REF: LCI-2026-8894</p>
                <p>&gt; AMOUNT: 250,000.00 EUR</p>
              </div>
            </div>
          </WifakBackground>
        )}

        {/* --- SLIDE 5: CONCLUSION --- */}
        {currentSlide === 5 && (
          <WifakBackground title="6. Conclusion">
            <div className="h-full flex flex-col items-center justify-center relative">
              <div className="text-center mb-16 relative z-10">
                <h1 className="text-5xl font-bold mb-4">
                  Une Banque <span className="text-[#be1e2d]">Agile</span>
                </h1>
                <p className="text-xl text-slate-300">
                  Conformité Sharia & Excellence Opérationnelle
                </p>
              </div>

              <div className="grid grid-cols-3 gap-8 w-full px-8">
                <div className="bg-white/5 p-6 rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-center group">
                  <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <CheckCircle size={32} className="text-green-400" />
                  </div>
                  <h3 className="font-bold mb-2">Conforme</h3>
                  <p className="text-xs text-slate-400">
                    Respect total des normes (NO-2026)
                  </p>
                </div>

                <div className="bg-white/5 p-6 rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-center group">
                  <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp size={32} className="text-blue-400" />
                  </div>
                  <h3 className="font-bold mb-2">Performant</h3>
                  <p className="text-xs text-slate-400">
                    Gain de temps sur les validations
                  </p>
                </div>

                <div className="bg-white/5 p-6 rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-center group">
                  <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Lock size={32} className="text-red-400" />
                  </div>
                  <h3 className="font-bold mb-2">Sécurisé</h3>
                  <p className="text-xs text-slate-400">
                    Traçabilité complète des actions
                  </p>
                </div>
              </div>
            </div>
          </WifakBackground>
        )}
      </div>

      {!isFullScreen && (
        <p className="mt-4 text-slate-500 text-sm flex items-center gap-2">
          Astuce : Clique sur{" "}
          <span className="font-bold text-slate-700 bg-white px-2 py-1 rounded border">
            Lancer le Diaporama
          </span>{" "}
          pour le mode présentation.
        </p>
      )}
    </div>
  );
}
