"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  TrendingUp,
  Laptop,
  Lock,
  LayoutTemplate,
  Maximize2,
  X,
  ChevronRight,
  ChevronLeft,
  Target,
  List,
  Download,
  Loader2,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function PresentationGenerator() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const printRef = useRef<HTMLDivElement>(null);

  const slides = [
    { id: 0, title: "Introduction", type: "intro" },
    { id: 1, title: "1. Définition IJARA", type: "concept" },
    { id: 2, title: "2. Processus Règlement", type: "process" },
    { id: 3, title: "3. Matrice Délégation", type: "delegation" },
    { id: 4, title: "4. Import LCI", type: "lci" },
    { id: 5, title: "Conclusion", type: "conclusion" },
  ];

  // Gestion dynamique de la taille de l'écran pour le mode plein écran
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // --- CORRECTION GÉNÉRATION PDF ---
  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);

    try {
      // Format A4 paysage en mm
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const slideElements = Array.from(
        printRef.current.children,
      ) as HTMLElement[];

      for (let i = 0; i < slideElements.length; i++) {
        const slide = slideElements[i];

        // Capture avec paramètres optimisés pour éviter les erreurs
        const canvas = await html2canvas(slide, {
          scale: 2, // Bonne qualité
          useCORS: true, // Crucial pour les images externes/locales
          allowTaint: true,
          logging: false,
          backgroundColor: "#ffffff",
          width: 960,
          height: 540,
        });

        const imgData = canvas.toDataURL("image/png");
        if (i > 0) pdf.addPage("a4", "landscape");

        // On remplit toute la page A4 (297x210 mm)
        pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
      }

      pdf.save("Presentation_Wifak_IJARA.pdf");
    } catch (error) {
      console.error("Erreur PDF détaillée:", error);
      alert(
        "Erreur lors de la génération. Vérifiez que /logo.png est accessible.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // --- COMPOSANT DE FOND WIFAK OPTIMISÉ ---
  const WifakBackground = ({
    children,
    title,
    mode = "preview",
  }: {
    children: React.ReactNode;
    title: string;
    mode?: "preview" | "fullscreen" | "pdf";
  }) => {
    // Calcul automatique du zoom (scale) pour le plein écran
    let scale = 1;
    if (mode === "fullscreen" && windowSize.width > 0) {
      const scaleX = windowSize.width / 960;
      const scaleY = windowSize.height / 540;
      scale = Math.min(scaleX, scaleY); // On prend le minimum pour ne jamais sortir de l'écran
    }

    const baseStyles =
      "relative overflow-hidden bg-white text-slate-800 flex flex-col shrink-0 border border-slate-100 shadow-2xl transition-all duration-300";

    return (
      <div
        className={`${baseStyles} ${mode === "preview" ? "w-[960px] h-[540px] rounded-xl" : mode === "pdf" ? "w-[960px] h-[540px]" : ""}`}
        style={
          mode === "fullscreen"
            ? {
                width: "960px",
                height: "540px",
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) scale(${scale})`, // Centrage absolu avec scale
                zIndex: 100,
                boxShadow: "0 0 100px rgba(0,0,0,0.2)",
              }
            : {}
        }
      >
        {/* Forme Rouge (Identité visuelle) */}
        <div
          className="absolute top-0 right-0 w-[40%] h-[60%] bg-[#be1e2d] z-0"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
        ></div>

        {/* Forme Grise */}
        <div
          className="absolute bottom-0 right-0 w-[35%] h-[30%] bg-slate-50 z-0"
          style={{ clipPath: "polygon(100% 0, 0% 100%, 100% 100%)" }}
        ></div>

        {/* LOGO IMAGE (Intégration /logo.png) */}
        <div className="absolute bottom-6 right-8 z-20">
          <img
            src="/logo.png"
            alt="Wifak Bank"
            className="h-14 w-auto object-contain drop-shadow-sm"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>

        {/* Header Slide */}
        <div className="relative z-20 pt-10 px-16">
          <h2 className="text-4xl font-bold border-b-4 border-[#be1e2d] pb-4 inline-block mb-2 text-[#0e3b6e]">
            {title}
          </h2>
        </div>

        {/* Contenu Principal */}
        <div className="relative z-20 flex-1 px-16 py-4 flex flex-col justify-center overflow-hidden">
          {children}
        </div>

        {/* Footer */}
        <div className="relative z-20 pb-4 px-16 flex justify-between items-end text-slate-400 text-sm">
          <div>Réalisé par : Alaa Smeti</div>
          <div className="mr-52 font-medium">www.wifakbank.com</div>
        </div>
      </div>
    );
  };

  const renderSlideContent = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="h-full flex gap-8 items-center">
            <div className="flex-1 space-y-4">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-[#be1e2d] mb-4 flex items-center gap-2">
                  <Target size={24} /> Objectifs Stratégiques
                </h3>
                <ul className="space-y-4 text-slate-700">
                  <li className="flex gap-3">
                    <CheckCircle
                      size={18}
                      className="text-[#0e3b6e] shrink-0 mt-1"
                    />{" "}
                    <div>
                      <strong>Efficacité :</strong> Optimisation des flux (Note
                      NO-2026).
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle
                      size={18}
                      className="text-[#0e3b6e] shrink-0 mt-1"
                    />{" "}
                    <div>
                      <strong>Sécurité :</strong> Contrôles PROLEASE & Sharia.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle
                      size={18}
                      className="text-[#0e3b6e] shrink-0 mt-1"
                    />{" "}
                    <div>
                      <strong>Agilité :</strong> Délégation décentralisée.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex-1 h-full flex flex-col justify-center pl-6 border-l border-slate-100">
              <h3 className="text-xl font-bold text-[#0e3b6e] mb-6 flex items-center gap-2">
                <List size={24} /> Ordre du Jour
              </h3>
              <div className="space-y-3">
                {[
                  "Définition IJARA",
                  "Processus & Workflow",
                  "Matrice Délégation",
                  "Importation LCI",
                  "Conclusion",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-[#0e3b6e] text-white flex items-center justify-center text-xs font-bold group-hover:bg-[#be1e2d] transition-colors">
                      {idx + 1}
                    </div>
                    <div className="bg-slate-50 px-4 py-2 rounded-lg w-full text-sm font-medium border border-slate-100 shadow-sm">
                      {item}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="h-full flex flex-col justify-center items-center">
            <div className="flex items-center gap-12 w-full justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 bg-[#0e3b6e]/5 rounded-full flex items-center justify-center border-2 border-[#0e3b6e]/20">
                  <Building2 size={40} className="text-[#0e3b6e]" />
                </div>
                <div className="text-center font-bold text-[#0e3b6e]">
                  WIFAK BANK
                </div>
              </div>
              <div className="flex flex-col gap-6 relative w-48">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-[2px] bg-slate-200"></div>
                  <div className="bg-[#be1e2d] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                    ACHAT
                  </div>
                  <div className="flex-1 h-[2px] bg-slate-200"></div>
                </div>
                <div className="w-24 h-24 bg-gradient-to-br from-[#be1e2d] to-pink-700 rounded-xl shadow-lg flex items-center justify-center mx-auto border-2 border-white">
                  <Key size={48} className="text-white" />
                </div>
                <div className="flex items-center gap-2 flex-row-reverse">
                  <div className="flex-1 h-[2px] bg-slate-200"></div>
                  <div className="bg-sky-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                    LOYERS
                  </div>
                  <div className="flex-1 h-[2px] bg-slate-200"></div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border-2 border-slate-200">
                  <User size={40} className="text-slate-600" />
                </div>
                <div className="text-center font-bold text-slate-700">
                  CLIENT
                </div>
              </div>
            </div>
            <div className="mt-8 bg-slate-50 px-6 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-500 shadow-sm">
              Transfert de propriété en fin de contrat
            </div>
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Agence",
                desc: "Collecte Dossier",
                icon: FileText,
              },
              {
                step: "02",
                title: "Middle Office",
                desc: "Contrôle",
                icon: ShieldCheck,
              },
              {
                step: "03",
                title: "Trésorerie",
                desc: "Décaissement",
                icon: LayoutTemplate,
              },
              {
                step: "04",
                title: "Validation",
                desc: "Paiement",
                icon: CheckCircle,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 p-5 rounded-xl shadow-md h-48 flex flex-col justify-between relative hover:border-[#be1e2d] transition-all group"
              >
                <div className="text-3xl font-bold text-slate-100 absolute top-2 right-4 group-hover:text-red-50">
                  {item.step}
                </div>
                <div className="w-10 h-10 bg-[#be1e2d] rounded-lg flex items-center justify-center mb-2 shadow-sm">
                  <item.icon className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0e3b6e]">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );
      case 3:
        return (
          <div className="h-full flex items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-[#0e3b6e] mb-4">
                  Critères d'Escalade
                </h3>
                <ul className="space-y-3 text-slate-600 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" /> Montant
                    (Note 2026)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" /> Classe
                    BCT (0, 1, 2)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" /> Type de
                    Matériel
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex-1 flex flex-col-reverse items-center justify-center pt-4">
              {[
                "COMITÉ (> 800k)",
                "DGA (650-800k)",
                "PÔLE (200-300k)",
                "ZONE (100-200k)",
                "AGENCE (< 100k)",
              ].map((lvl, i) => (
                <div
                  key={i}
                  className="w-full bg-[#0e3b6e] text-white text-[10px] py-2 px-4 rounded mb-1 text-center font-bold opacity-90 transition-all hover:scale-105 hover:bg-[#be1e2d]"
                  style={{ width: `${100 - i * 8}%` }}
                >
                  {lvl}
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="h-full flex flex-col justify-center">
            <div className="flex justify-between items-center px-4">
              <div className="text-center">
                <Building2 size={32} className="text-slate-400 mx-auto mb-2" />
                <div className="font-bold text-xs text-slate-600">
                  Fournisseur
                </div>
              </div>
              <div className="flex-1 border-t-2 border-dashed border-slate-200 relative mx-4">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-[10px] font-bold text-sky-600">
                  CIF / FOB
                </div>
              </div>
              <div className="text-center group">
                <div className="w-24 h-24 bg-sky-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-2 border-4 border-white group-hover:bg-[#0e3b6e] transition-colors">
                  <Globe size={40} className="text-white animate-pulse" />
                </div>
                <div className="font-bold text-xs text-sky-700">
                  WIFAK TRADE
                </div>
              </div>
              <div className="flex-1 border-t-2 border-dashed border-slate-200 relative mx-4">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-[10px] font-bold text-emerald-600 uppercase">
                  Dédouanement
                </div>
              </div>
              <div className="text-center">
                <User size={32} className="text-slate-400 mx-auto mb-2" />
                <div className="font-bold text-xs text-slate-600">Client</div>
              </div>
            </div>
            <div className="mt-8 mx-auto w-1/2 bg-slate-900 rounded-lg p-3 font-mono text-[10px] text-green-400 shadow-2xl border border-slate-700">
              <p>&gt; SENDING MT700... SUCCESS</p>
              <p>&gt; REF: LCI-2026-8894</p>
              <p>&gt; AMOUNT: 250,000.00 EUR</p>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-[#0e3b6e]">
                Une Banque <span className="text-[#be1e2d]">Agile</span>
              </h1>
              <p className="text-slate-500 mt-2 font-medium">
                Partenaire de votre réussite
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6 w-full">
              {["CONFORME", "PERFORMANT", "SÉCURISÉ"].map((txt, i) => (
                <div
                  key={i}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-lg text-center group hover:border-[#be1e2d] transition-all"
                >
                  <div className="w-14 h-14 mx-auto bg-[#0e3b6e]/5 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <CheckCircle size={28} className="text-[#0e3b6e]" />
                  </div>
                  <h3 className="font-bold text-sm text-[#0e3b6e] uppercase tracking-wider">
                    {txt}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="font-sans bg-white text-slate-900 flex flex-col items-center justify-center min-h-screen transition-colors duration-300">
      {/* Contrôles Navigation & Action */}
      {!isFullScreen && (
        <div className="fixed top-20 w-full z-40 px-4 pointer-events-none">
          <div className="max-w-5xl mx-auto flex justify-between items-center pointer-events-auto bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-2xl">
            <div className="flex gap-1.5">
              {slides.map((slide, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${currentSlide === idx ? "bg-[#0e3b6e] text-white shadow-lg" : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100"}`}
                >
                  {slide.id + 1}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className={`flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all border border-slate-200 shadow-sm ${isGenerating ? "opacity-50 cursor-wait" : ""}`}
              >
                {isGenerating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}{" "}
                PDF
              </button>
              <button
                onClick={() => setIsFullScreen(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#be1e2d] text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-all shadow-xl hover:shadow-red-200 active:scale-95"
              >
                <Maximize2 size={16} /> Lancer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE NORMAL: Aperçu */}
      {!isFullScreen && (
        <div className="mt-28 animate-in fade-in zoom-in duration-500">
          <WifakBackground title={slides[currentSlide].title} mode="preview">
            {renderSlideContent(currentSlide)}
          </WifakBackground>
        </div>
      )}

      {/* MODE PLEIN ÉCRAN: Immersif (Autonome et proportionné) */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center overflow-hidden">
          <WifakBackground title={slides[currentSlide].title} mode="fullscreen">
            {renderSlideContent(currentSlide)}
          </WifakBackground>

          {/* Bouton Fermer */}
          <button
            onClick={() => setIsFullScreen(false)}
            className="absolute top-8 left-8 z-[110] bg-white/90 hover:bg-red-50 text-red-600 p-3.5 rounded-full shadow-2xl border border-red-100 transition-all active:scale-90"
          >
            <X size={28} />
          </button>

          {/* Navigation Flottante */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-12 pointer-events-none z-[110]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide((prev) => Math.max(prev - 1, 0));
              }}
              className={`pointer-events-auto p-5 rounded-full bg-white/80 hover:bg-[#be1e2d] hover:text-white text-[#0e3b6e] transition-all shadow-2xl backdrop-blur-md border border-slate-100 ${currentSlide === 0 ? "opacity-0" : "opacity-100"}`}
            >
              <ChevronLeft size={44} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide((prev) =>
                  Math.min(prev + 1, slides.length - 1),
                );
              }}
              className={`pointer-events-auto p-5 rounded-full bg-white/80 hover:bg-[#be1e2d] hover:text-white text-[#0e3b6e] transition-all shadow-2xl backdrop-blur-md border border-slate-100 ${currentSlide === slides.length - 1 ? "opacity-0" : "opacity-100"}`}
            >
              <ChevronRight size={44} />
            </button>
          </div>
        </div>
      )}

      {/* CONTENEUR CACHÉ POUR PDF (Dimensions strictes 960x540) */}
      <div
        ref={printRef}
        style={{
          position: "fixed",
          top: 0,
          left: "-4000px",
          width: "960px",
          pointerEvents: "none",
        }}
      >
        {slides.map((slide, idx) => (
          <div
            key={idx}
            style={{ width: 960, height: 540, overflow: "hidden" }}
          >
            <WifakBackground title={slide.title} mode="pdf">
              {renderSlideContent(idx)}
            </WifakBackground>
          </div>
        ))}
      </div>

      {!isFullScreen && (
        <p className="mt-8 text-slate-400 text-xs font-medium italic animate-pulse">
          Utilisez les flèches du clavier ou les boutons flottants pour
          naviguer.
        </p>
      )}
    </div>
  );
}
