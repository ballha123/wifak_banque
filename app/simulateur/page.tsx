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
  User,
  Hash,
  Truck,
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
  id: string; // Référence Dossier
  client: string; // Nom Client
  montant: number;
  typeBien: string; // slug pour règle de gestion (roulant_neuf, etc)
  fournisseur: string;
  documents: DossierDocuments;
  status: string;
  history: HistoryLog[];
}

// --- FONCTIONS UTILITAIRES ---

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

  const [dossier, setDossier] = useState<DossierState>({
    id: `PRL-${new Date().getFullYear()}-0842`,
    client: "SOCIETE TRANSPORT DU SUD",
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
        logAction(
          "AGENCE",
          "Envoi Dossier",
          `Dossier ${dossier.id} pour ${dossier.client} transmis au MO`,
        );
        setCurrentStep(1);
      } else if (currentStep === 1) {
        if (isFastTrack) {
          logAction(
            "MO",
            "Transfert Direct",
            "Circuit Court (Matériel Roulant < 100kDT) -> Trésorerie",
          );
          setCurrentStep(3);
        } else {
          logAction("MO", "Transfert Standard", "Circuit Standard -> BO IJARA");
          setCurrentStep(2);
        }
      } else if (currentStep === 7) {
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
      setCurrentStep(1);
    } else {
      setCurrentStep((prev) => Math.max(0, prev - 1));
    }
  };

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
              Gestion des Règlements Fournisseurs IJARA
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
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-8 min-h-[550px] flex flex-col">
              <div className="flex-1">
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

                <div className="animate-in fade-in duration-500">
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <FileText size={18} className="text-[#be1e2d]" />
                        Données de Base du Règlement
                      </h3>

                      <div className="grid grid-cols-2 gap-6">
                        {/* IDENTITÉ CLIENT */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                            <User size={12} /> Nom du Client (Locataire)
                          </label>
                          <input
                            type="text"
                            value={dossier.client}
                            onChange={(e) =>
                              setDossier({ ...dossier, client: e.target.value })
                            }
                            className="w-full p-3 border rounded-xl bg-slate-50 font-semibold focus:ring-2 focus:ring-[#0e3b6e] outline-none"
                            placeholder="Ex: SOCIETE EXEMPLE SARL"
                          />
                        </div>

                        {/* RÉFÉRENCE PROLEASE */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                            <Hash size={12} /> Référence Dossier (PROLEASE)
                          </label>
                          <input
                            type="text"
                            value={dossier.id}
                            onChange={(e) =>
                              setDossier({ ...dossier, id: e.target.value })
                            }
                            className="w-full p-3 border rounded-xl bg-slate-50 font-mono focus:ring-2 focus:ring-[#0e3b6e] outline-none"
                          />
                        </div>

                        {/* FOURNISSEUR */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                            <Building2 size={12} /> Fournisseur (Bénéficiaire)
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
                            className="w-full p-3 border rounded-xl bg-slate-50 font-semibold focus:ring-2 focus:ring-[#0e3b6e] outline-none"
                          />
                        </div>

                        {/* MONTANT */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                            <Coins size={12} /> Montant à régler (TND TTC)
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
                            className="w-full p-3 border rounded-xl bg-slate-50 font-bold text-[#0e3b6e] focus:ring-2 focus:ring-[#0e3b6e] outline-none"
                          />
                        </div>

                        {/* TYPE DE BIEN */}
                        <div className="space-y-1 col-span-2">
                          <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                            <Truck size={12} /> Nature du Bien Financé
                          </label>
                          <select
                            value={dossier.typeBien}
                            onChange={(e) =>
                              setDossier({
                                ...dossier,
                                typeBien: e.target.value,
                              })
                            }
                            className="w-full p-3 border rounded-xl bg-slate-50 font-medium focus:ring-2 focus:ring-[#0e3b6e] outline-none"
                          >
                            <option value="roulant_neuf">
                              Matériel Roulant Neuf (Eligible Circuit Court)
                            </option>
                            <option value="roulant_occasion">
                              Matériel Roulant Occasion
                            </option>
                            <option value="btp">
                              Matériel de BTP / Industriel
                            </option>
                            <option value="medical">Matériel Médical</option>
                            <option value="immobilier">
                              Immobilier professionnel
                            </option>
                          </select>
                        </div>
                      </div>

                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-sm flex gap-3 shadow-sm">
                        <AlertCircle size={20} className="shrink-0" />
                        <p className="font-medium">
                          Note 2021-033 : Le dossier scanné doit impérativement
                          inclure la facture définitive, le PV de réception
                          signé et l'assurance At-Takafulia.
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
                          Règle Métier Détectée
                        </div>
                        <p className="text-sm">
                          {isFastTrack
                            ? "✅ Matériel Roulant Neuf < 100 kDT. Éligibilité au CIRCUIT COURT confirmée."
                            : "ℹ️ Circuit Standard requis : Validation technique BO IJARA nécessaire."}
                        </p>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4 text-center py-10">
                      <ShieldCheck
                        size={64}
                        className="mx-auto text-indigo-600 mb-4 animate-bounce"
                      />
                      <h3 className="font-bold text-slate-700 text-xl">
                        Validation BO IJARA
                      </h3>
                      <p className="text-slate-500 max-w-md mx-auto">
                        Vérification de la conformité juridique du contrat et de
                        l'objet financé sur le système iMal.
                      </p>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <h3 className="font-bold text-slate-700 uppercase tracking-tighter">
                        Émission O.D. (Trésorerie 1)
                      </h3>
                      <div className="p-8 bg-[#0e3b6e] text-white rounded-3xl shadow-2xl relative overflow-hidden">
                        <LayoutTemplate
                          size={120}
                          className="absolute -right-8 -bottom-8 opacity-10"
                        />
                        <div className="text-xs uppercase opacity-70 font-bold mb-4">
                          Système PROLEASE
                        </div>
                        <div className="text-3xl font-mono font-black mb-6 tracking-tighter">
                          GENERATE O.D. #OD-{dossier.id.split("-").pop()}
                        </div>
                        <div className="flex gap-4">
                          <Badge color="emerald">Constatation OK</Badge>
                          <Badge color="blue">Calcul RAS Effectué</Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep >= 4 && currentStep <= 6 && (
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="w-full max-w-md p-8 bg-white border border-slate-200 rounded-3xl shadow-2xl relative border-t-[12px] border-t-[#0e3b6e]">
                        <div className="absolute top-4 right-4 text-[8px] font-mono text-slate-300">
                          MODÈLE BANCAIRE
                        </div>
                        <div className="flex justify-between items-start mb-8">
                          <div className="font-serif font-black text-2xl text-[#0e3b6e]">
                            WIFAK BANK
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 font-bold">
                              MONTANT
                            </div>
                            <div className="font-mono font-bold text-[#be1e2d]">
                              {formatCurrency(dossier.montant)}
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-widest">
                          Ordre de :
                        </div>
                        <div className="font-black text-lg border-b-2 border-slate-100 pb-2 mb-4 text-slate-700">
                          {dossier.fournisseur}
                        </div>
                        <div className="flex justify-between items-end mt-12">
                          <div className="text-[9px] text-slate-400">
                            RÉF DOSS: {dossier.id}
                          </div>
                          <div className="flex gap-2">
                            {currentStep >= 5 && (
                              <div className="w-20 h-10 bg-[#0e3b6e]/5 border border-dashed border-[#0e3b6e]/20 rounded-lg flex items-center justify-center text-[10px] font-bold text-[#0e3b6e] -rotate-6">
                                VISA BO
                              </div>
                            )}
                            {currentStep >= 6 && (
                              <div className="w-20 h-10 bg-red-500/5 border border-dashed border-red-500/20 rounded-lg flex items-center justify-center text-[10px] font-bold text-red-600 -rotate-3">
                                SIGNATURE
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-sm font-medium text-slate-500 max-w-md italic">
                        {currentStep === 4 &&
                          "BO Trésorerie 2 : Confection physique du support (Chèque/Virement/Traite)."}
                        {currentStep === 5 &&
                          "Responsable BO Trésorerie : Validation finale et insertion réf. support dans PROLEASE."}
                        {currentStep === 6 &&
                          "Direction : Signature conjointe (Direction Opérationnelle + Financière)."}
                      </p>
                    </div>
                  )}

                  {currentStep === 7 && (
                    <div className="text-center space-y-6 py-10">
                      <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle size={48} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-[#0e3b6e] tracking-tight">
                          Règlement Libéré
                        </h2>
                        <p className="text-slate-500 mt-2 font-medium">
                          Notification envoyée à l'Agence. Contrat IJARA n°
                          {dossier.id} mis en force.
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
                  className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all ${currentStep === 0 ? "opacity-0 pointer-events-none" : "bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95"}`}
                >
                  <ArrowLeft size={18} /> Précédent
                </button>

                <button
                  onClick={handleNext}
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${currentStep === 7 ? "bg-[#0e3b6e] text-white hover:bg-[#0e3b6e]/90 shadow-indigo-100" : "bg-[#be1e2d] text-white hover:bg-red-700 shadow-red-200"}`}
                >
                  {currentStep === 7 ? "Nouveau Règlement" : "Étape Suivante"}
                  {currentStep !== 7 && <ArrowRight size={18} />}
                </button>
              </div>
            </Card>
          </div>

          {/* SIDEBAR RÉSUMÉ */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            <Card className="p-6 bg-slate-900 text-white overflow-hidden relative shadow-2xl">
              <Building2
                size={120}
                className="absolute -right-8 -bottom-8 opacity-5 text-white"
              />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
                Résumé du Dossier
              </h3>
              <div className="space-y-4 relative z-10 font-medium">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-500 uppercase">
                    Référence
                  </span>
                  <span className="text-sm font-mono text-emerald-400">
                    {dossier.id}
                  </span>
                </div>
                <div className="flex flex-col border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-500 uppercase mb-1">
                    Client
                  </span>
                  <span className="text-sm uppercase tracking-tight">
                    {dossier.client}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-500 uppercase">
                    Montant
                  </span>
                  <span className="text-sm font-bold">
                    {formatCurrency(dossier.montant)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-500 uppercase">
                    Circuit
                  </span>
                  <Badge color={isFastTrack ? "emerald" : "blue"}>
                    {isFastTrack ? "FAST-TRACK" : "STANDARD"}
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-slate-200">
              <h3 className="font-bold text-[#0e3b6e] mb-4 flex items-center gap-2">
                <History size={18} className="text-[#be1e2d]" /> Historique
                (Logs)
              </h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {dossier.history.length === 0 ? (
                  <div className="text-center py-6 text-slate-300 italic text-sm">
                    Aucune action enregistrée
                  </div>
                ) : (
                  dossier.history.map((log, i) => (
                    <div
                      key={i}
                      className="flex gap-3 border-l-2 border-slate-100 pl-4 pb-4 last:pb-0"
                    >
                      <div className="flex-1">
                        <div className="text-[10px] font-black text-[#be1e2d] uppercase">
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
          </div>
        </div>
      </main>
    </div>
  );
}
