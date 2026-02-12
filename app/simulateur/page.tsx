"use client";

import React, { useState, ChangeEvent } from "react";
import {
  Building2,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  UserCheck,
  Calculator,
  RefreshCw,
  Scan,
  Printer,
  PenTool,
  Send,
  History,
  ShieldCheck,
  LucideIcon,
  LayoutTemplate,
  Coins,
} from "lucide-react";

// --- TYPES & INTERFACES ---

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
}

interface RoleDef {
  label: string;
  icon: LucideIcon;
  color: string;
}

interface HistoryLog {
  time: string;
  role: string;
  action: string;
  detail: string;
}

interface DossierDocuments {
  facture: boolean;
  pvReception: boolean;
  carteGrise: boolean;
  assurance: boolean;
}

interface DossierState {
  id: string;
  client: string;
  montant: number;
  typeBien: string;
  fournisseur: string;
  documents: DossierDocuments;
  status: string;
  history: HistoryLog[];
}

// --- FONCTIONS UTILITAIRES ---

/**
 * Formate un nombre en devise Tunisienne (TND)
 */
const formatCurrency = (val: number) =>
  new Intl.NumberFormat("fr-TN", {
    style: "currency",
    currency: "TND",
  }).format(val);

// --- COMPOSANTS UI ---
const Card = ({ children, className = "" }: CardProps) => (
  <div
    className={`bg-white rounded-2xl shadow-xl border border-slate-100 ${className}`}
  >
    {children}
  </div>
);

const Badge = ({ children, color = "slate" }: BadgeProps) => {
  const colors: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
    red: "bg-red-50 text-red-600 border-red-100",
  };
  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-bold border ${colors[color] || colors.slate}`}
    >
      {children}
    </span>
  );
};

const ROLES: Record<string, RoleDef> = {
  AGENCE: {
    label: "Agence / Chargé Clientèle",
    icon: Building2,
    color: "bg-slate-800",
  },
  MO: { label: "Middle Office IJARA", icon: ShieldCheck, color: "bg-blue-600" },
  BO_IJARA: { label: "BO IJARA", icon: Briefcase, color: "bg-indigo-600" },
  BO_TRESO_1: {
    label: "BO Trésorerie 1",
    icon: Calculator,
    color: "bg-emerald-600",
  },
  BO_TRESO_2: {
    label: "BO Trésorerie 2",
    icon: Printer,
    color: "bg-emerald-700",
  },
  RESP_TRESO: {
    label: "Responsable BO Trésorerie",
    icon: UserCheck,
    color: "bg-purple-600",
  },
  DIRECTION: {
    label: "Direction / Signataires",
    icon: PenTool,
    color: "bg-slate-900",
  },
};

type RoleKey = keyof typeof ROLES;

export default function IjaraSettlementSimulator() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("simulation");

  const [dossier, setDossier] = useState<DossierState>({
    id: `D-${new Date().getFullYear()}-001`,
    client: "Société Transport Rapide",
    montant: 85000,
    typeBien: "roulant_neuf",
    fournisseur: "AutoTruck Tunisie",
    documents: {
      facture: true,
      pvReception: true,
      carteGrise: true,
      assurance: true,
    },
    status: "INIT",
    history: [],
  });

  const logAction = (role: RoleKey, action: string, detail: string) => {
    const newLog: HistoryLog = {
      time: new Date().toLocaleTimeString(),
      role: ROLES[role].label,
      action,
      detail,
    };
    setDossier((prev) => ({ ...prev, history: [newLog, ...prev.history] }));
  };

  const isFastTrack =
    dossier.typeBien === "roulant_neuf" && dossier.montant < 100000;

  // --- NAVIGATION WORKFLOW ---

  const handleNext = () => {
    setLoading(true);
    setTimeout(() => {
      if (currentStep === 0) {
        logAction("AGENCE", "Envoi Dossier", "Transmission au Middle Office");
        setCurrentStep(1);
      } else if (currentStep === 1) {
        if (isFastTrack) {
          logAction(
            "MO",
            "Transfert Direct",
            "Circuit Court (< 100KDT) -> Trésorerie",
          );
          setCurrentStep(3); // On saute l'étape 2 (BO IJARA)
        } else {
          logAction("MO", "Transfert Standard", "Circuit Standard -> BO IJARA");
          setCurrentStep(2);
        }
      } else if (currentStep === 7) {
        // Reset
        setCurrentStep(0);
        setDossier((prev) => ({ ...prev, status: "INIT", history: [] }));
      } else {
        setCurrentStep((prev) => prev + 1);
      }
      setLoading(false);
    }, 800);
  };

  const handleBack = () => {
    if (currentStep === 3 && isFastTrack) {
      setCurrentStep(1); // On revient au MO depuis la tréso en circuit court
    } else {
      setCurrentStep((prev) => Math.max(0, prev - 1));
    }
  };

  // Étapes visuelles pour la barre de progression
  const wizardSteps = [
    { label: "Saisie", icon: FileText },
    { label: "Contrôle MO", icon: ShieldCheck },
    { label: "BO IJARA", icon: Briefcase, hide: isFastTrack },
    { label: "Treso 1", icon: Calculator },
    { label: "Treso 2", icon: Printer },
    { label: "Validation", icon: UserCheck },
    { label: "Signature", icon: PenTool },
    { label: "Terminé", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans p-4 md:p-8">
      {/* HEADER AVEC BARRE DE PROGRESSION */}
      <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#be1e2d] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
            W
          </div>
          <div>
            <h1 className="font-bold text-2xl text-[#0e3b6e]">
              Workflow Règlements
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Présentation Interactive Processus IJARA
            </p>
          </div>
        </div>

        <div className="flex items-center bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto max-w-full">
          {wizardSteps.map((step, idx) => {
            if (step.hide) return null;
            const isCompleted =
              currentStep > idx ||
              (isFastTrack && idx === 2 && currentStep > 1);
            const isCurrent = currentStep === idx;

            return (
              <React.Fragment key={idx}>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-all ${isCurrent ? "bg-[#be1e2d] text-white shadow-md scale-110" : isCompleted ? "bg-[#0e3b6e] text-white" : "bg-slate-200 text-slate-400"}`}
                >
                  <step.icon size={18} />
                </div>
                {idx < wizardSteps.length - 1 &&
                  !wizardSteps[idx + 1]?.hide && (
                    <div
                      className={`w-6 h-0.5 mx-1 rounded ${isCompleted ? "bg-[#0e3b6e]" : "bg-slate-200"}`}
                    ></div>
                  )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ZONE D'ACTION PRINCIPALE */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-8 min-h-[500px] flex flex-col">
              <div className="flex-1">
                {/* ACTEUR HEADER */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#0e3b6e]/5 text-[#0e3b6e] rounded-lg">
                      {React.createElement(wizardSteps[currentStep].icon, {
                        size: 24,
                      })}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Étape Actuelle
                      </span>
                      <h2 className="text-xl font-bold text-[#0e3b6e]">
                        {wizardSteps[currentStep].label}
                      </h2>
                    </div>
                  </div>
                  {loading && (
                    <RefreshCw
                      size={20}
                      className="animate-spin text-[#be1e2d]"
                    />
                  )}
                </div>

                {/* CONTENU DYNAMIQUE PAR ÉTAPE */}
                <div className="animate-in fade-in duration-500">
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <h3 className="font-bold text-slate-700">
                        Initialisation du dossier Agence
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase">
                            Fournisseur
                          </label>
                          <input
                            type="text"
                            value={dossier.fournisseur}
                            onChange={(e) =>
                              setDossier({
                                ...dossier,
                                fournisseur: e.target.value,
                              })
                            }
                            className="w-full p-3 border rounded-xl bg-slate-50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase">
                            Montant (TND)
                          </label>
                          <input
                            type="number"
                            value={dossier.montant}
                            onChange={(e) =>
                              setDossier({
                                ...dossier,
                                montant: Number(e.target.value),
                              })
                            }
                            className="w-full p-3 border rounded-xl bg-slate-50"
                          />
                        </div>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-sm flex gap-3">
                        <AlertCircle size={20} className="shrink-0" />
                        <p>
                          Vérifiez que le PV de réception et la facture
                          définitive sont conformes à la Note de Service
                          2021-033.
                        </p>
                      </div>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <h3 className="font-bold text-slate-700">
                        Contrôle Middle Office
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(dossier.documents).map((doc) => (
                          <div
                            key={doc}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                          >
                            <span className="text-sm font-medium capitalize">
                              {doc.replace(/([A-Z])/g, " $1")}
                            </span>
                            <CheckCircle
                              size={20}
                              className="text-emerald-500"
                            />
                          </div>
                        ))}
                      </div>
                      <div
                        className={`p-4 rounded-xl border shadow-sm ${isFastTrack ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-blue-50 border-blue-100 text-blue-800"}`}
                      >
                        <div className="font-bold text-xs uppercase mb-1">
                          Analyse Automatique
                        </div>
                        <p className="text-sm">
                          {isFastTrack
                            ? "✅ Matériel Roulant < 100 kDT détecté. Éligible au CIRCUIT COURT."
                            : "ℹ️ Dossier standard. Passage requis par le BO IJARA."}
                        </p>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-700">
                        Validation Technique BO IJARA
                      </h3>
                      <p className="text-slate-500 text-sm">
                        Vérification de la conformité juridique du bien et des
                        garanties spécifiques au contrat de location.
                      </p>
                      <div className="h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                        En attente de validation métier...
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <h3 className="font-bold text-slate-700">
                        BO Trésorerie : Constatation PROLEASE
                      </h3>
                      <div className="p-6 bg-[#0e3b6e] text-white rounded-2xl shadow-xl relative overflow-hidden">
                        <LayoutTemplate
                          size={80}
                          className="absolute -right-4 -bottom-4 opacity-10"
                        />
                        <div className="text-xs uppercase opacity-70 font-bold mb-2">
                          Module PROLEASE
                        </div>
                        <div className="text-2xl font-mono mb-4">
                          GENERATION O.D. #OD-2026-X
                        </div>
                        <div className="flex gap-2">
                          <Badge color="emerald">OD Généré</Badge>
                          <Badge color="blue">Certificat RAS prêt</Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep >= 4 && currentStep <= 6 && (
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="w-full max-w-md p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl relative">
                        <div className="absolute top-2 right-2 text-[8px] font-mono text-slate-300">
                          SPECIMEN
                        </div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="font-serif font-bold text-xl text-[#0e3b6e]">
                            WIFAK BANK
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400">
                              MONTANT
                            </div>
                            <div className="font-mono font-bold">
                              {formatCurrency(dossier.montant)}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 mb-1">
                          A L'ORDRE DE :
                        </div>
                        <div className="font-bold border-b border-slate-100 pb-2 mb-4">
                          {dossier.fournisseur}
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="text-[8px] text-slate-300">
                            REF: {dossier.id}
                          </div>
                          <div className="flex gap-2">
                            {currentStep >= 5 && (
                              <div className="w-16 h-8 bg-[#0e3b6e]/5 border border-[#0e3b6e]/10 rounded flex items-center justify-center text-[10px] font-bold text-[#0e3b6e] -rotate-6">
                                VISA RESP
                              </div>
                            )}
                            {currentStep >= 6 && (
                              <div className="w-16 h-8 bg-red-500/5 border border-red-500/10 rounded flex items-center justify-center text-[10px] font-bold text-red-600 -rotate-3">
                                SIGNATURE
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-sm text-slate-500">
                        {currentStep === 4 &&
                          "Confection du support de règlement (Chèque/Virement)."}
                        {currentStep === 5 &&
                          "Validation formelle par le Responsable BO Trésorerie."}
                        {currentStep === 6 &&
                          "Signature conjointe du support par la Direction."}
                      </p>
                    </div>
                  )}

                  {currentStep === 7 && (
                    <div className="text-center space-y-6 py-10">
                      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle size={40} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-[#0e3b6e]">
                          Processus Finalisé
                        </h2>
                        <p className="text-slate-500">
                          Le support de règlement a été libéré. Contrat IJARA
                          mis en force.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* BARRE DE NAVIGATION INTERACTIVE */}
              <div className="mt-12 pt-8 border-t border-slate-50 flex gap-4">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0 || loading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${currentStep === 0 ? "opacity-0 pointer-events-none" : "bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95"}`}
                >
                  <ArrowLeft size={18} /> Précédent
                </button>

                <button
                  onClick={handleNext}
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${currentStep === 7 ? "bg-[#0e3b6e] text-white hover:bg-[#0e3b6e]/90" : "bg-[#be1e2d] text-white hover:bg-red-700 shadow-red-200"}`}
                >
                  {currentStep === 7 ? "Nouvelle Simulation" : "Étape Suivante"}
                  {currentStep !== 7 && <ArrowRight size={18} />}
                </button>
              </div>
            </Card>
          </div>

          {/* SIDEBAR LOGS ET RÉSUMÉ */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            <Card className="p-6">
              <h3 className="font-bold text-[#0e3b6e] mb-4 flex items-center gap-2">
                <History size={18} /> Historique Dossier
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {dossier.history.length === 0 ? (
                  <div className="text-center py-10 text-slate-300 italic text-sm">
                    Aucun événement
                  </div>
                ) : (
                  dossier.history.map((log, i) => (
                    <div
                      key={i}
                      className="flex gap-3 border-l-2 border-slate-100 pl-4 pb-4 last:pb-0"
                    >
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-[#be1e2d]">
                          {log.role}
                        </div>
                        <div className="text-sm font-bold text-slate-700">
                          {log.action}
                        </div>
                        <div className="text-xs text-slate-400">
                          {log.detail}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-6 bg-slate-900 text-white">
              <div className="text-xs font-bold text-slate-400 uppercase mb-4">
                Résumé du Bien
              </div>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-500">Montant</span>
                  <span className="text-sm font-bold">
                    {formatCurrency(dossier.montant)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-500">Circuit</span>
                  <Badge color={isFastTrack ? "emerald" : "blue"}>
                    {isFastTrack ? "Court" : "Standard"}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
