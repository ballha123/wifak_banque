"use client";

import React, { useState, ChangeEvent } from "react";
import {
  Building2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  UserCheck,
  Globe,
  RefreshCw,
  Scan,
  History,
  ShieldCheck,
  Mail,
  Lock,
  Coins,
  LucideIcon,
  FileText,
  AlertCircle,
  Info,
} from "lucide-react";

// --- TYPES & INTERFACES ---

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface BadgeProps {
  children: React.ReactNode;
  color?: "slate" | "emerald" | "amber" | "blue" | "indigo" | "purple" | "cyan";
}

interface RoleDefinition {
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

interface DossierState {
  ref: string;
  client: string;
  fournisseur: string;
  pays: string;
  montant: number;
  devise: string;
  incoterm: string;
  swiftDraftRequired: boolean;
  coursChange: number | null;
  status: string;
  history: HistoryLog[];
}

// --- FONCTIONS UTILITAIRES ---

const formatCurrency = (val: number, cur: string) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: cur }).format(
    val,
  );

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
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    cyan: "bg-cyan-100 text-cyan-700 border-cyan-200",
  };
  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-bold border ${colors[color] || colors.slate}`}
    >
      {children}
    </span>
  );
};

const ROLES: Record<string, RoleDefinition> = {
  AGENCE: {
    label: "Agence / Chargé Clientèle",
    icon: Building2,
    color: "bg-slate-800",
  },
  MO_IJARA: { label: "MO IJARA", icon: ShieldCheck, color: "bg-blue-600" },
  BO_IJARA: { label: "BO IJARA", icon: Briefcase, color: "bg-indigo-600" },
  RISQUE: {
    label: "Responsable Risque IJARA",
    icon: Lock,
    color: "bg-red-600",
  },
  MO_TRADE: { label: "MO Trade Finance", icon: Scan, color: "bg-cyan-600" },
  CH_COMEX: { label: "Chargé Comex", icon: Globe, color: "bg-sky-600" },
  RESP_COMEX: { label: "Resp. Comex", icon: UserCheck, color: "bg-sky-800" },
};

type RoleKey = keyof typeof ROLES;

export default function LCIProcessSimulator() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [draftFeedback, setDraftFeedback] = useState<string>("ok");

  const [dossier, setDossier] = useState<DossierState>({
    ref: `LCI-${new Date().getFullYear()}-042`,
    client: "Import-Export SA",
    fournisseur: "German Machines GmbH",
    pays: "Allemagne",
    montant: 250000,
    devise: "EUR",
    incoterm: "CIF",
    swiftDraftRequired: true,
    coursChange: null,
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

  // --- NAVIGATION WORKFLOW ---

  const handleNext = () => {
    setLoading(true);
    setTimeout(() => {
      if (currentStep === 0) {
        logAction(
          "MO_IJARA",
          "Saisie iMal",
          "Création CIF Fournisseur GL 364101",
        );
        setCurrentStep(1);
      } else if (currentStep === 1) {
        logAction(
          "RISQUE",
          "Validation",
          "Émission Notification Ouverture LCI",
        );
        setCurrentStep(2);
      } else if (currentStep === 3 && draftFeedback === "modif") {
        logAction("AGENCE", "Correction", "Draft amendé suite retour client");
        setDraftFeedback("ok");
        // On ne change pas d'étape, on boucle sur le draft
      } else if (currentStep === 6) {
        setCurrentStep(0);
        setDossier((prev) => ({ ...prev, history: [] }));
      } else {
        setCurrentStep((prev) => prev + 1);
      }
      setLoading(false);
    }, 800);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const wizardSteps = [
    { label: "Fournisseur", icon: Building2 },
    { label: "Risques", icon: Lock },
    { label: "Guichet Trade", icon: Mail },
    { label: "Draft SWIFT", icon: FileText },
    { label: "Émission MT700", icon: Scan },
    { label: "Closing / Change", icon: Coins },
    { label: "Finalisé", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans p-4 md:p-8">
      {/* HEADER AVEC PROGRESSION */}
      <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
            W
          </div>
          <div>
            <h1 className="font-bold text-2xl text-[#0e3b6e]">
              LCI Import IJARA
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Simulation Processus Trade Finance
            </p>
          </div>
        </div>

        <div className="flex items-center bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto max-w-full">
          {wizardSteps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-all ${currentStep === idx ? "bg-cyan-600 text-white shadow-md scale-110" : currentStep > idx ? "bg-[#0e3b6e] text-white" : "bg-slate-200 text-slate-400"}`}
              >
                <step.icon size={18} />
              </div>
              {idx < wizardSteps.length - 1 && (
                <div
                  className={`w-6 h-0.5 mx-1 rounded ${currentStep > idx ? "bg-[#0e3b6e]" : "bg-slate-200"}`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ZONE D'ACTION PRINCIPALE */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-8 min-h-[500px] flex flex-col">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg">
                      {React.createElement(wizardSteps[currentStep].icon, {
                        size: 24,
                      })}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Étape {currentStep + 1}
                      </span>
                      <h2 className="text-xl font-bold text-[#0e3b6e]">
                        {wizardSteps[currentStep].label}
                      </h2>
                    </div>
                  </div>
                  {loading && (
                    <RefreshCw
                      size={20}
                      className="animate-spin text-cyan-600"
                    />
                  )}
                </div>

                <div className="animate-in fade-in duration-500">
                  {/* STEP 0: SUPPLIER */}
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <h3 className="font-bold text-slate-700">
                        Création du compte Fournisseur
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">
                            Bénéficiaire
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
                            className="w-full p-3 border rounded-xl bg-slate-50 font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">
                            Devise
                          </label>
                          <select
                            value={dossier.devise}
                            onChange={(e) =>
                              setDossier({ ...dossier, devise: e.target.value })
                            }
                            className="w-full p-3 border rounded-xl bg-slate-50"
                          >
                            <option>EUR</option>
                            <option>USD</option>
                            <option>GBP</option>
                          </select>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-sm flex gap-3">
                        <Info size={20} className="shrink-0" />
                        <p>
                          Le compte "GL 364101" doit être ouvert sur iMal par le
                          BO IJARA avant toute notification au Trade Finance.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STEP 1: RISK */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <h3 className="font-bold text-slate-700">
                        Contrôle Risque & Engagement
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          "Demande Ouverture",
                          "Contrat 1ère Partie",
                          "Avis de Blocage",
                          "Facture Proforma",
                        ].map((doc) => (
                          <div
                            key={doc}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                          >
                            <span className="text-sm font-medium">{doc}</span>
                            <CheckCircle
                              size={20}
                              className="text-emerald-500"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-slate-500 italic text-center">
                        Le Responsable Risque signe la notification d'ouverture
                        autorisant le Comex à émettre.
                      </p>
                    </div>
                  )}

                  {/* STEP 2: TRADE TRANSFER */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <h3 className="font-bold text-slate-700">
                        Transmission au Guichet Trade
                      </h3>
                      <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center text-cyan-600">
                          <Mail size={32} />
                        </div>
                        <div>
                          <div className="font-bold text-[#0e3b6e]">
                            Email: Commerce.Exterieur@wifakbank.com
                          </div>
                          <p className="text-sm text-slate-400 mt-1">
                            Envoi du dossier scanné complet pour vérification de
                            cohérence.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: SWIFT DRAFT */}
                  {currentStep === 3 && (
                    <div className="space-y-8">
                      <h3 className="font-bold text-slate-700">
                        Validation du Draft MT700
                      </h3>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setDraftFeedback("ok")}
                          className={`flex-1 p-6 rounded-2xl border-2 transition-all text-center ${draftFeedback === "ok" ? "border-emerald-500 bg-emerald-50" : "border-slate-100 hover:border-emerald-200"}`}
                        >
                          <CheckCircle
                            size={32}
                            className={`mx-auto mb-2 ${draftFeedback === "ok" ? "text-emerald-500" : "text-slate-300"}`}
                          />
                          <div className="font-bold text-sm">
                            Validé par Client
                          </div>
                        </button>
                        <button
                          onClick={() => setDraftFeedback("modif")}
                          className={`flex-1 p-6 rounded-2xl border-2 transition-all text-center ${draftFeedback === "modif" ? "border-amber-50 bg-amber-50" : "border-slate-100 hover:border-amber-200"}`}
                        >
                          <RefreshCw
                            size={32}
                            className={`mx-auto mb-2 ${draftFeedback === "modif" ? "text-amber-500" : "text-slate-300"}`}
                          />
                          <div className="font-bold text-sm">
                            Modifs Requises
                          </div>
                        </button>
                      </div>
                      {draftFeedback === "modif" && (
                        <div className="animate-in slide-in-from-top-2 p-4 bg-amber-100/50 rounded-xl text-amber-900 text-xs border border-amber-200">
                          ⚠️ Le processus restera à cette étape jusqu'à ce que
                          le Comex intègre les corrections et renvoie le draft.
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 4: EMISSION */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <h3 className="font-bold text-slate-700">
                        Émission SWIFT MT700
                      </h3>
                      <div className="bg-slate-900 text-green-400 font-mono text-[10px] p-6 rounded-2xl shadow-2xl relative overflow-hidden border border-slate-700">
                        <div className="absolute top-0 right-0 p-2 bg-slate-800 text-slate-500 text-[8px]">
                          SWIFT NETWORK
                        </div>
                        <p>:700: MT700 ISSUE</p>
                        <p>:20: {dossier.ref}</p>
                        <p>:50: {dossier.client.toUpperCase()}</p>
                        <p>:59: {dossier.fournisseur.toUpperCase()}</p>
                        <p>
                          :32B: {dossier.devise} {dossier.montant}
                        </p>
                        <p className="mt-4 text-white animate-pulse">
                          TRANSMISSION EN COURS...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: CLOSING */}
                  {currentStep === 5 && (
                    <div className="space-y-8">
                      <h3 className="font-bold text-slate-700">
                        Réception Documents & Fixation Change
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                          <div className="text-[10px] font-bold text-slate-400 mb-1">
                            MONTANT DEVISE
                          </div>
                          <div className="text-xl font-mono font-bold text-[#0e3b6e]">
                            {formatCurrency(dossier.montant, dossier.devise)}
                          </div>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border-2 border-cyan-500">
                          <div className="text-[10px] font-bold text-cyan-600 mb-1">
                            COURS NÉGOCIÉ (TND)
                          </div>
                          <input
                            type="number"
                            defaultValue="3.350"
                            step="0.001"
                            className="w-full text-xl font-mono font-bold outline-none"
                          />
                        </div>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-sm flex gap-3">
                        <Coins size={20} className="shrink-0" />
                        <p>
                          Après validation, la Base Locative sur{" "}
                          <strong>IMALL</strong> sera actualisée avec le montant
                          contre-valeur TND définitif.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: FINISH */}
                  {currentStep === 6 && (
                    <div className="text-center space-y-6 py-10">
                      <div className="w-20 h-20 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle size={40} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-[#0e3b6e]">
                          LCI Clôturée
                        </h2>
                        <p className="text-slate-500 max-w-sm mx-auto">
                          Le règlement a été effectué via MT754. Les documents
                          originaux sont disponibles pour dédouanement.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* NAVIGATION */}
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
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${currentStep === 6 ? "bg-[#0e3b6e] text-white hover:bg-[#0e3b6e]/90" : "bg-cyan-600 text-white hover:bg-cyan-700 shadow-cyan-200"}`}
                >
                  {currentStep === 6
                    ? "Réinitialiser"
                    : currentStep === 3 && draftFeedback === "modif"
                      ? "Traiter Modif"
                      : "Étape Suivante"}
                  {currentStep !== 6 && <ArrowRight size={18} />}
                </button>
              </div>
            </Card>
          </div>

          {/* SIDEBAR LOGS */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            <Card className="p-6">
              <h3 className="font-bold text-[#0e3b6e] mb-4 flex items-center gap-2">
                <History size={18} /> Logs Comex
              </h3>
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                {dossier.history.length === 0 ? (
                  <div className="text-center py-10 text-slate-300 italic text-sm">
                    Aucun événement enregistré
                  </div>
                ) : (
                  dossier.history.map((log, i) => (
                    <div
                      key={i}
                      className="flex gap-3 border-l-2 border-slate-100 pl-4 pb-4 last:pb-0"
                    >
                      <div className="flex-1">
                        <div className="text-[9px] font-black text-cyan-600 uppercase tracking-tighter">
                          {log.role}
                        </div>
                        <div className="text-sm font-bold text-slate-700 leading-tight">
                          {log.action}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {log.detail}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-6 bg-slate-900 text-white overflow-hidden relative">
              <Globe
                size={100}
                className="absolute -right-8 -bottom-8 opacity-10 text-white"
              />
              <div className="text-xs font-bold text-slate-400 uppercase mb-4 relative z-10">
                Résumé LCI
              </div>
              <div className="space-y-3 relative z-10">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-500">Référence</span>
                  <span className="text-xs font-mono">{dossier.ref}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-500">Incoterm</span>
                  <Badge color="cyan">{dossier.incoterm}</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
