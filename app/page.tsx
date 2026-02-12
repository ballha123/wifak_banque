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
  Presentation,
  Scale,
  AlertCircle,
  Info,
} from "lucide-react";

/**
 * APPLICATION DE PRÉSENTATION WIFAK BANK
 * Mise à jour selon Note d'Organisation 2026/0001
 */
export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [libsLoaded, setLibsLoaded] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const printRef = useRef<HTMLDivElement>(null);

  const slides = [
    { id: 0, title: "Introduction", type: "intro" },
    { id: 1, title: "1. Le Mécanisme IJARA", type: "concept" },
    { id: 2, title: "2. Processus de Règlement", type: "process" },
    { id: 3, title: "3. Matrice de Délégation 2026", type: "delegation" },
    { id: 4, title: "4. Importation LCI", type: "lci" },
    { id: 5, title: "Conclusion", type: "conclusion" },
  ];

  useEffect(() => {
    const loadScript = (src: string, globalName: string) => {
      return new Promise((resolve) => {
        if ((window as any)[globalName]) return resolve(true);
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
      });
    };

    const initLibs = async () => {
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js",
        "htmlToImage",
      );
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
        "jspdf",
      );
      await loadScript(
        "https://cdn.jsdelivr.net/gh/gitbrent/PptxGenJS@3.12.0/dist/pptxgen.bundle.js",
        "PptxGenJS",
      );
      setLibsLoaded(true);
    };

    initLibs();

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

  const handleDownloadPDF = async () => {
    const h2i = (window as any).htmlToImage;
    const { jsPDF } = (window as any).jspdf || {};
    if (!printRef.current || !h2i || !jsPDF) return;

    setIsGenerating(true);
    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      const slideElements = Array.from(
        printRef.current.children,
      ) as HTMLElement[];
      for (let i = 0; i < slideElements.length; i++) {
        const imgData = await h2i.toPng(slideElements[i], {
          width: 960,
          height: 540,
          pixelRatio: 2,
        });
        if (i > 0) pdf.addPage("a4", "landscape");
        pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
      }
      pdf.save("Wifak_Note_2026_Delegation.pdf");
    } catch (e) {
      console.error(e);
    }
    setIsGenerating(false);
  };

  const handleDownloadPPTX = async () => {
    const h2i = (window as any).htmlToImage;
    const PptxGenJS = (window as any).PptxGenJS;
    if (!printRef.current || !h2i || !PptxGenJS) return;

    setIsGenerating(true);
    try {
      const pres = new PptxGenJS();
      pres.layout = "LAYOUT_WIDE";
      const slideElements = Array.from(
        printRef.current.children,
      ) as HTMLElement[];
      for (let i = 0; i < slideElements.length; i++) {
        const imgData = await h2i.toPng(slideElements[i], {
          width: 960,
          height: 540,
          pixelRatio: 2,
        });
        const slide = pres.addSlide();
        slide.addImage({ data: imgData, x: 0, y: 0, w: "100%", h: "100%" });
      }
      pres.writeFile({ fileName: "Wifak_Note_2026_Delegation.pptx" });
    } catch (e) {
      console.error(e);
    }
    setIsGenerating(false);
  };

  const WifakBackground = ({
    children,
    title,
    mode = "preview",
  }: {
    children: React.ReactNode;
    title: string;
    mode?: "preview" | "fullscreen" | "pdf";
  }) => {
    let scale = 1;
    if (mode === "fullscreen" && windowSize.width > 0) {
      const scaleX = windowSize.width / 960;
      const scaleY = windowSize.height / 540;
      scale = Math.min(scaleX, scaleY);
    }

    return (
      <div
        className={`relative overflow-hidden bg-white text-slate-800 flex flex-col shrink-0 border border-slate-100 shadow-2xl transition-all duration-500 ${mode === "preview" ? "w-[960px] h-[540px] rounded-xl" : mode === "pdf" ? "w-[960px] h-[540px]" : ""}`}
        style={
          mode === "fullscreen"
            ? {
                width: "960px",
                height: "540px",
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) scale(${scale})`,
                zIndex: 100,
                transformOrigin: "center center",
              }
            : {}
        }
      >
        <div
          className="absolute top-0 right-0 w-[40%] h-[60%] bg-[#be1e2d] z-0"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
        ></div>
        <div
          className="absolute bottom-0 right-0 w-[35%] h-[30%] bg-slate-50 z-0"
          style={{ clipPath: "polygon(100% 0, 0% 100%, 100% 100%)" }}
        ></div>
        <div className="absolute bottom-6 right-8 z-20">
          <img
            src="/logo.png"
            alt="Wifak"
            className="h-16 w-auto object-contain drop-shadow-sm"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>
        <div className="relative z-20 pt-10 px-16">
          <h2 className="text-4xl font-bold border-b-4 border-[#be1e2d] pb-4 inline-block mb-2 text-[#0e3b6e]">
            {title}
          </h2>
        </div>
        <div className="relative z-20 flex-1 px-16 py-4 flex flex-col justify-center overflow-hidden">
          {children}
        </div>
        <div className="relative z-20 pb-4 px-16 flex justify-between items-end text-slate-400 text-sm font-bold uppercase tracking-tighter">
          <div>Réalisé par : Alaa Smeti</div>
          <div className="mr-56 italic text-[#be1e2d]">www.wifakbank.com</div>
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
                <ul className="space-y-4 text-slate-700 font-bold">
                  <li className="flex gap-3">
                    <CheckCircle
                      size={18}
                      className="text-[#0e3b6e] shrink-0 mt-1"
                    />{" "}
                    <div>
                      Efficacité Opérationnelle : Réduction des délais de
                      traitement (Note NO-2026).
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle
                      size={18}
                      className="text-[#0e3b6e] shrink-0 mt-1"
                    />{" "}
                    <div>
                      Sécurité & Conformité : Digitalisation des contrôles
                      PROLEASE & Sharia.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle
                      size={18}
                      className="text-[#0e3b6e] shrink-0 mt-1"
                    />{" "}
                    <div>
                      Agilité Décisionnelle : Nouvelle matrice décentralisée.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex-1 h-full flex flex-col justify-center pl-6 border-l border-slate-100 font-bold">
              <h3 className="text-xl font-bold text-[#0e3b6e] mb-6 flex items-center gap-2">
                <List size={24} /> Ordre du Jour
              </h3>
              <div className="space-y-3">
                {[
                  "Le Mécanisme IJARA",
                  "Processus de Règlement",
                  "Matrice de Délégation 2026",
                  "Importation LCI",
                  "Conclusion",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#0e3b6e] text-white flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="bg-slate-50 px-4 py-2 rounded-lg w-full text-sm border border-slate-100 shadow-sm">
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
          <div className="h-full flex flex-col justify-center items-center font-bold text-[#0e3b6e]">
            <div className="flex items-center gap-12 w-full justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 bg-[#0e3b6e]/5 rounded-full flex items-center justify-center border-2 border-[#0e3b6e]/20">
                  <Building2 size={40} />
                </div>
                <div>WIFAK BANK</div>
              </div>
              <div className="flex flex-col gap-6 relative w-48 text-center">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-[2px] bg-slate-200"></div>
                  <div className="bg-[#be1e2d] text-white px-2 py-0.5 rounded text-[10px]">
                    ACHAT
                  </div>
                  <div className="flex-1 h-[2px] bg-slate-200"></div>
                </div>
                <div className="w-24 h-24 bg-gradient-to-br from-[#be1e2d] to-pink-700 rounded-xl shadow-lg flex items-center justify-center mx-auto border-2 border-white">
                  <Key size={48} className="text-white" />
                </div>
                <div className="flex items-center gap-2 flex-row-reverse">
                  <div className="flex-1 h-[2px] bg-slate-200"></div>
                  <div className="bg-sky-600 text-white px-2 py-0.5 rounded text-[10px]">
                    LOYER
                  </div>
                  <div className="flex-1 h-[2px] bg-slate-200"></div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 text-slate-700">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border-2 border-slate-200">
                  <User size={40} />
                </div>
                <div>CLIENT</div>
              </div>
            </div>
            <div className="mt-8 bg-slate-50 px-6 py-2 rounded-full border border-slate-200 text-xs font-black text-slate-500 uppercase shadow-sm">
              Transfert de propriété en fin de contrat
            </div>
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-4 gap-4 font-bold">
            {[
              {
                step: "01",
                title: "Agence",
                desc: "Collecte & Scan Dossier",
                icon: FileText,
              },
              {
                step: "02",
                title: "Middle Office",
                desc: "Contrôle Exhaustivité",
                icon: ShieldCheck,
              },
              {
                step: "03",
                title: "Trésorerie",
                desc: "Ordonnancement",
                icon: LayoutTemplate,
              },
              {
                step: "04",
                title: "Validation",
                desc: "Signature & Paiement",
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
                <div className="w-10 h-10 bg-[#be1e2d] rounded-lg flex items-center justify-center mb-2">
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
          <div className="h-full flex flex-col gap-4 font-bold text-[#0e3b6e]">
            <div className="grid grid-cols-5 gap-2 text-center text-[10px] uppercase tracking-tighter">
              <div className="bg-[#0e3b6e] text-white p-2 rounded">
                Agence (DA)
              </div>
              <div className="bg-[#0e3b6e]/80 text-white p-2 rounded">
                Zone (DZ)
              </div>
              <div className="bg-[#0e3b6e]/60 text-white p-2 rounded">
                Pôle (CPC)
              </div>
              <div className="bg-[#be1e2d]/80 text-white p-2 rounded">
                Risque (CPR)
              </div>
              <div className="bg-[#be1e2d] text-white p-2 rounded">
                Direction (DGA)
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg flex-1">
              <table className="w-full h-full text-[11px] border-collapse">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[9px]">
                  <tr>
                    <th className="p-2 border-b border-r text-left">
                      Indicateur (Note 2026)
                    </th>
                    <th className="p-2 border-b border-r">DA</th>
                    <th className="p-2 border-b border-r">DZ</th>
                    <th className="p-2 border-b border-r">CPC</th>
                    <th className="p-2 border-b border-r">CPR</th>
                    <th className="p-2 border-b">DGA</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  <tr className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="p-2 border-b border-r font-black">
                      Classe BCT
                    </td>
                    <td className="p-2 border-b border-r text-center">0</td>
                    <td className="p-2 border-b border-r text-center">0</td>
                    <td className="p-2 border-b border-r text-center">0 - 1</td>
                    <td className="p-2 border-b border-r text-center">0 - 1</td>
                    <td className="p-2 border-b text-center">-</td>
                  </tr>
                  <tr className="bg-slate-50/30">
                    <td className="p-2 border-b border-r font-black">
                      Plafond Dossier
                    </td>
                    <td className="p-2 border-b border-r text-center font-bold text-blue-700 text-xs">
                      100 mD
                    </td>
                    <td className="p-2 border-b border-r text-center font-bold text-blue-700 text-xs">
                      200 mD
                    </td>
                    <td className="p-2 border-b border-r text-center font-bold text-blue-700 text-xs">
                      300 mD
                    </td>
                    <td className="p-2 border-b border-r text-center font-bold text-red-700 text-xs">
                      0.65 MD
                    </td>
                    <td className="p-2 border-b text-center font-bold text-red-700 text-xs">
                      0.8 MD
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b border-r font-black">
                      Premier Loyer
                    </td>
                    <td className="p-2 border-b border-r text-center">
                      20% /( 30% pour agriculteurs)
                    </td>
                    <td className="p-2 border-b border-r text-center">10%</td>
                    <td className="p-2 border-b border-r text-center"></td>
                    <td className="p-2 border-b border-r text-center"></td>
                    <td className="p-2 border-b border-r text-center"></td>
                  </tr>
                  <tr className="bg-slate-50/30">
                    <td className="p-2 border-b border-r font-black">
                      Taux Min / Apport
                    </td>
                    <td className="p-2 border-b border-r text-center">
                      15% / 20%
                    </td>
                    <td className="p-2 border-b border-r text-center">
                      13.5% / 10%
                    </td>
                    <td className="p-2 border-b border-r text-center">
                      12.5% / -
                    </td>
                    <td className="p-2 border-b border-r text-center">
                      11.5% / -
                    </td>
                    <td className="p-2 border-b text-center">11% / -</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r font-black text-[9px]">
                      Exclusions Réseau
                    </td>
                    <td className="p-2 border-r text-[8px] leading-none italic text-slate-400 text-center">
                      Taxi, Louage, Occasion, Spécifique
                    </td>
                    <td className="p-2 border-r text-[8px] leading-none italic text-slate-400 text-center">
                      Taxi, Louage, Spécifique
                    </td>
                    <td className="p-2 border-r text-[8px] leading-none italic text-slate-400 text-center">
                      Matériel Spécifique
                    </td>
                    <td className="p-2 border-r text-[8px] leading-none italic text-slate-400 text-center">
                      Matériel Spécifique
                    </td>
                    <td className="p-2 text-center text-[8px]">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 bg-blue-50 p-2 rounded-lg border border-blue-100 text-[9px] items-center">
              <Info size={12} className="text-blue-600 shrink-0" />
              <span>
                Circuit : CC → DA → Analyste Risque → DZ → CPC → CPR → DGA
                (Selon seuils)
              </span>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="h-full flex flex-col justify-center font-bold">
            <div className="flex justify-between items-center px-4">
              <div className="text-center">
                <Building2 size={32} className="text-slate-400 mx-auto mb-2" />
                <div className="font-bold text-xs text-slate-600">
                  Fournisseur
                </div>
              </div>
              <div className="flex-1 border-t-2 border-dashed border-slate-200 relative mx-4">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-[10px] font-bold text-sky-600 uppercase">
                  CIF / FOB
                </div>
              </div>
              <div className="text-center group">
                <div className="w-24 h-24 bg-sky-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-2 border-4 border-white group-hover:bg-[#0e3b6e] transition-colors">
                  <Globe size={40} className="text-white animate-pulse" />
                </div>
                <div className="font-bold text-xs text-sky-700 uppercase">
                  Wifak Trade
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
              <p>&gt; CONNEXION PASSERELLE...</p>
              <p>&gt; ENVOI MT700... SUCCESS</p>
              <p>&gt; REF: LCI-2026-8894</p>
              <p>&gt; MONTANT: 250,000.00 EUR</p>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="h-full flex flex-col items-center justify-center font-bold">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-[#0e3b6e]">
                Une Banque <span className="text-[#be1e2d]">Agile</span>
              </h1>
              <p className="text-slate-500 mt-2 font-medium italic">
                Accélérer la transformation digitale
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6 w-full px-4 text-center">
              {["CONFORMITÉ", "PERFORMANCE", "SÉCURITÉ"].map((txt, i) => (
                <div
                  key={i}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-lg group hover:border-[#be1e2d] transition-all"
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
      {!isFullScreen && (
        <div className="fixed top-20 w-full z-40 px-4 pointer-events-none">
          <div className="max-w-5xl mx-auto flex justify-between items-center pointer-events-auto bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-2xl">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
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
                className={`flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 border border-slate-200 shadow-sm ${isGenerating ? "opacity-50 cursor-wait" : ""}`}
              >
                {isGenerating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}{" "}
                PDF
              </button>
              <button
                onClick={handleDownloadPPTX}
                disabled={isGenerating}
                className={`flex items-center gap-2 px-5 py-2.5 bg-[#0e3b6e] text-white rounded-xl font-bold text-xs hover:bg-[#0e3b6e]/90 shadow-md ${isGenerating ? "opacity-50 cursor-wait" : ""}`}
              >
                <Presentation size={16} /> PPTX
              </button>
              <button
                onClick={() => setIsFullScreen(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#be1e2d] text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-all shadow-xl"
              >
                <Maximize2 size={16} /> Lancer
              </button>
            </div>
          </div>
        </div>
      )}

      {!isFullScreen && (
        <div className="mt-28 animate-in fade-in zoom-in duration-500">
          <WifakBackground title={slides[currentSlide].title} mode="preview">
            {renderSlideContent(currentSlide)}
          </WifakBackground>
        </div>
      )}

      {isFullScreen && (
        <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center overflow-hidden">
          <WifakBackground title={slides[currentSlide].title} mode="fullscreen">
            {renderSlideContent(currentSlide)}
          </WifakBackground>
          <button
            onClick={() => setIsFullScreen(false)}
            className="absolute top-8 left-8 z-[110] bg-white/90 hover:bg-red-50 text-red-600 p-3.5 rounded-full shadow-2xl border border-red-100 transition-all active:scale-90 shadow-red-200"
          >
            <X size={28} />
          </button>
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-12 pointer-events-none z-[110]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide((prev) => Math.max(prev - 1, 0));
              }}
              className={`pointer-events-auto p-5 rounded-full bg-white/80 hover:bg-[#be1e2d] hover:text-white text-[#0e3b6e] transition-all shadow-2xl backdrop-blur-md border border-slate-100 ${currentSlide === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
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

      <div
        ref={printRef}
        style={{
          position: "fixed",
          top: 0,
          left: "-3000px",
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
    </div>
  );
}
