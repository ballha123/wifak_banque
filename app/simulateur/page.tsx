"use client";
import React, { useState, ChangeEvent } from "react";
import {
  Building2,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight,
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

// --- COMPOSANTS UI ---
const Card = ({ children, className = "" }: CardProps) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}
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

// --- DONNÉES DE REFERENCE ---
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
  // État du dossier
  // We explicitly type the state here to avoid 'history' being inferred as never[]
  const [dossier, setDossier] = useState<DossierState>({
    id: `D-${new Date().getFullYear()}-001`,
    client: "Société Transport Rapide",
    montant: 85000,
    typeBien: "roulant_neuf", // roulant_neuf, autre
    fournisseur: "AutoTruck Tunisie",
    documents: {
      facture: true,
      pvReception: true,
      carteGrise: true,
      assurance: true,
    },
    status: "INIT", // INIT, MO_CHECK, BO_CHECK, TRESO_CHECK, PAYMENT_PREP, VALIDATION, SIGNED, RELEASED
    history: [],
  });

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("simulation");
  const [loading, setLoading] = useState<boolean>(false);

  // Fonction pour ajouter une entrée à l'historique
  const logAction = (role: RoleKey, action: string, detail: string) => {
    const newLog: HistoryLog = {
      time: new Date().toLocaleTimeString(),
      role: ROLES[role].label,
      action,
      detail,
    };
    setDossier((prev) => ({ ...prev, history: [newLog, ...prev.history] }));
  };

  // --- ACTIONS DU WORKFLOW ---

  // 1. Agence envoie le dossier
  const handleAgencySubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setDossier((prev) => ({ ...prev, status: "MO_CHECK" }));
      logAction(
        "AGENCE",
        "Envoi Dossier",
        "Transmission au Middle Office (NS 2021-033)",
      );
      setCurrentStep(1);
      setLoading(false);
    }, 1000);
  };

  // 2. Middle Office Vérifie
  const handleMOCheck = (isCompliant: boolean) => {
    if (!isCompliant) {
      alert("Dossier incomplet : Retour à l'agence !");
      logAction("MO", "Rejet", "Dossier non exhaustif - Retour Agence");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // RÈGLE MÉTIER IMPORTANTE : < 100 KDT & Roulant Neuf -> Direct Trésorerie
      const isFastTrack =
        dossier.typeBien === "roulant_neuf" && dossier.montant < 100000;

      if (isFastTrack) {
        setDossier((prev) => ({ ...prev, status: "TRESO_CHECK" }));
        logAction(
          "MO",
          "Transfert Direct",
          "Circuit Court (Matériel Roulant < 100KDT) -> BO Trésorerie",
        );
        setCurrentStep(3); // Saut de l'étape BO IJARA
      } else {
        setDossier((prev) => ({ ...prev, status: "BO_CHECK" }));
        logAction("MO", "Transfert Standard", "Circuit Standard -> BO IJARA");
        setCurrentStep(2);
      }
      setLoading(false);
    }, 1500);
  };

  // 3. BO IJARA (Si circuit standard)
  const handleBOIjaraCheck = () => {
    setLoading(true);
    setTimeout(() => {
      setDossier((prev) => ({ ...prev, status: "TRESO_CHECK" }));
      logAction(
        "BO_IJARA",
        "Validation Technique",
        "Transfert vers BO Trésorerie",
      );
      setCurrentStep(3);
      setLoading(false);
    }, 1500);
  };

  // 4. BO Trésorerie 1 (Constatation & Ordre Décaissement)
  const handleBOTreso1 = () => {
    setLoading(true);
    setTimeout(() => {
      setDossier((prev) => ({ ...prev, status: "PAYMENT_PREP" }));
      logAction(
        "BO_TRESO_1",
        "Constatation PROLEASE",
        "Génération Ordre Décaissement + Certif RAS",
      );
      logAction(
        "BO_TRESO_1",
        "Transfert",
        "Envoi dossier scanné à BO Trésorerie 2",
      );
      setCurrentStep(4);
      setLoading(false);
    }, 2000);
  };

  // 5. BO Trésorerie 2 (Confection Règlement)
  const handleBOTreso2_Prep = () => {
    setLoading(true);
    setTimeout(() => {
      setDossier((prev) => ({ ...prev, status: "VALIDATION" }));
      logAction("BO_TRESO_2", "Édition", "Édition Chèque/Ordre de Virement");
      setCurrentStep(5);
      setLoading(false);
    }, 1500);
  };

  // 6. Responsable BO Trésorerie (Validation)
  const handleManagerValidation = () => {
    setLoading(true);
    setTimeout(() => {
      setDossier((prev) => ({ ...prev, status: "SIGNING" }));
      logAction(
        "RESP_TRESO",
        "Validation Formelle",
        "Insertion Réf. Support dans PROLEASE",
      );
      setCurrentStep(6);
      setLoading(false);
    }, 1000);
  };

  // 7. Direction (Signature)
  const handleSignature = () => {
    setLoading(true);
    setTimeout(() => {
      setDossier((prev) => ({ ...prev, status: "RELEASED" }));
      logAction(
        "DIRECTION",
        "Signature",
        "Signature conjointe (Dir Ops + Fin)",
      );
      setCurrentStep(7);
      setLoading(false);
    }, 2000);
  };

  // 8. Finalisation (BO Trésorerie 2)
  const handleFinalRelease = () => {
    setLoading(true);
    setTimeout(() => {
      setDossier((prev) => ({ ...prev, status: "CLOSED" }));
      logAction(
        "BO_TRESO_2",
        "Libération",
        "Envoi mail boucle Agence + Mise en force IJARA",
      );
      alert("Processus terminé avec succès !");
      setLoading(false);
    }, 1000);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("fr-TN", {
      style: "currency",
      currency: "TND",
    }).format(val);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              W
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-slate-800">
                Gestion Règlements Fournisseurs
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Processus IJARA V0.3 - Simulation
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("simulation")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "simulation" ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-100"}`}
            >
              Simulateur
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "details" ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-100"}`}
            >
              Détails Dossier
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "simulation" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN: WORKFLOW VISUALIZER */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="p-0 overflow-hidden sticky top-24">
                <div className="bg-slate-900 text-white p-4 border-b border-slate-800">
                  <h3 className="font-bold flex items-center gap-2">
                    <History size={18} /> Circuit de Validation
                  </h3>
                </div>
                <div className="p-4 space-y-6">
                  {[
                    { id: 0, label: "Mise en Place (Agence)", role: "AGENCE" },
                    { id: 1, label: "Contrôle Middle Office", role: "MO" },
                    {
                      id: 2,
                      label: "Contrôle BO IJARA",
                      role: "BO_IJARA",
                      skipped:
                        currentStep > 2 &&
                        dossier.history.some((h) =>
                          h.detail.includes("Circuit Court"),
                        ),
                    },
                    {
                      id: 3,
                      label: "Contrôle & Constatation (BO T1)",
                      role: "BO_TRESO_1",
                    },
                    {
                      id: 4,
                      label: "Confection Règlement (BO T2)",
                      role: "BO_TRESO_2",
                    },
                    {
                      id: 5,
                      label: "Validation (Responsable)",
                      role: "RESP_TRESO",
                    },
                    {
                      id: 6,
                      label: "Signature (Direction)",
                      role: "DIRECTION",
                    },
                    {
                      id: 7,
                      label: "Libération & Mise en force",
                      role: "BO_TRESO_2",
                    },
                  ].map((step, idx) => (
                    <div
                      key={idx}
                      className={`relative pl-8 ${step.skipped ? "opacity-30 hidden" : ""}`}
                    >
                      {idx < 7 && !step.skipped && (
                        <div
                          className={`absolute left-[11px] top-6 bottom-[-24px] w-0.5 ${idx < currentStep ? "bg-emerald-500" : "bg-slate-200"}`}
                        ></div>
                      )}
                      <div
                        className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold z-10 
                        ${
                          idx < currentStep
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : idx === currentStep
                              ? "bg-white border-blue-500 text-blue-500 animate-pulse"
                              : "bg-white border-slate-300 text-slate-300"
                        }`}
                      >
                        {idx < currentStep ? (
                          <CheckCircle size={14} />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <div className="text-sm font-medium">{step.label}</div>
                      <div className="text-xs text-slate-500">
                        {ROLES[step.role as RoleKey].label}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* RIGHT COLUMN: INTERACTIVE AREA */}
            <div className="lg:col-span-8">
              {/* CURRENT ACTOR BANNER */}
              <div className="mb-6 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-800 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      {/* Icone Dynamique selon l'étape */}
                      {(() => {
                        const steps = [
                          ROLES.AGENCE,
                          ROLES.MO,
                          ROLES.BO_IJARA,
                          ROLES.BO_TRESO_1,
                          ROLES.BO_TRESO_1,
                          ROLES.BO_TRESO_2,
                          ROLES.RESP_TRESO,
                          ROLES.DIRECTION,
                          ROLES.BO_TRESO_2,
                        ];
                        const RoleIcon = steps[currentStep]?.icon || Building2;
                        return <RoleIcon size={24} />;
                      })()}
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                        Acteur en cours
                      </div>
                      <div className="font-bold text-lg">
                        {currentStep === 0 && ROLES.AGENCE.label}
                        {currentStep === 1 && ROLES.MO.label}
                        {currentStep === 2 && ROLES.BO_IJARA.label}
                        {(currentStep === 3 || currentStep === 4) &&
                          ROLES.BO_TRESO_1.label}
                        {currentStep === 5 && ROLES.BO_TRESO_2.label}
                        {currentStep === 6 && ROLES.RESP_TRESO.label}
                        {currentStep === 7 && ROLES.DIRECTION.label}
                        {currentStep > 7 && "Processus Terminé"}
                      </div>
                    </div>
                  </div>
                  {loading && (
                    <div className="flex items-center gap-2 text-sm text-emerald-400 animate-pulse">
                      <RefreshCw className="animate-spin" size={16} />{" "}
                      Traitement...
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION CARDS */}
              <div className="space-y-6">
                {/* STEP 0: INITIALISATION */}
                {currentStep === 0 && (
                  <Card className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <FileText className="text-emerald-600" /> Données du
                      Règlement
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          Bénéficiaire (Fournisseur)
                        </label>
                        <input
                          type="text"
                          value={dossier.fournisseur}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setDossier({
                              ...dossier,
                              fournisseur: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          Montant à Régler
                        </label>
                        <input
                          type="number"
                          value={dossier.montant}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setDossier({
                              ...dossier,
                              montant: Number(e.target.value),
                            })
                          }
                          className="w-full p-2 border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          Type de Bien
                        </label>
                        <select
                          value={dossier.typeBien}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                            setDossier({ ...dossier, typeBien: e.target.value })
                          }
                          className="w-full p-2 border rounded text-sm bg-slate-50"
                        >
                          <option value="roulant_neuf">
                            Matériel Roulant Neuf (Standard)
                          </option>
                          <option value="immobilier">Immobilier</option>
                          <option value="equipement">
                            Équipement Industriel
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mb-6 text-sm text-amber-800 flex gap-2">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <p>
                        Assurez-vous que la facture définitive et le PV de
                        réception sont signés et joints au dossier physique.
                      </p>
                    </div>

                    <button
                      onClick={handleAgencySubmit}
                      disabled={loading}
                      className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 flex justify-center gap-2"
                    >
                      Transmettre au Middle Office <Send size={18} />
                    </button>
                  </Card>
                )}

                {/* STEP 1: MIDDLE OFFICE CHECK */}
                {currentStep === 1 && (
                  <Card className="p-6">
                    <h3 className="font-bold text-lg mb-4">
                      Contrôle Exhaustivité (NS 2021-033)
                    </h3>
                    <div className="space-y-3 mb-6">
                      {Object.keys(dossier.documents).map((doc) => (
                        <div
                          key={doc}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100"
                        >
                          <span className="text-sm font-medium text-slate-700 capitalize">
                            {doc.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <div className="flex gap-2">
                            <button className="text-xs px-2 py-1 bg-white border rounded text-slate-500 hover:text-blue-600">
                              Visualiser
                            </button>
                            <input
                              type="checkbox"
                              checked={true}
                              readOnly
                              className="accent-emerald-600 w-4 h-4"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mb-6">
                      <div className="text-xs font-bold text-blue-800 uppercase mb-1">
                        Règle de Gestion Détectée
                      </div>
                      <div className="text-sm text-blue-700">
                        {dossier.typeBien === "roulant_neuf" &&
                        dossier.montant < 100000
                          ? "✅ Matériel Roulant < 100 kDT : Éligible Circuit Court (Passage direct BO Trésorerie)."
                          : "⚠️ Circuit Standard : Validation BO IJARA requise."}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleMOCheck(false)}
                        className="flex-1 border border-red-200 text-red-600 py-3 rounded-lg font-medium hover:bg-red-50"
                      >
                        Rejeter (Incomplet)
                      </button>
                      <button
                        onClick={() => handleMOCheck(true)}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
                      >
                        Valider & Transférer
                      </button>
                    </div>
                  </Card>
                )}

                {/* STEP 2: BO IJARA (Conditional) */}
                {currentStep === 2 && (
                  <Card className="p-6 border-l-4 border-indigo-500">
                    <h3 className="font-bold text-lg mb-4">
                      Vérification Métier BO IJARA
                    </h3>
                    <p className="text-slate-600 text-sm mb-6">
                      Vérification approfondie du dossier juridique et
                      conformité technique du bien financé.
                    </p>
                    <button
                      onClick={handleBOIjaraCheck}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700"
                    >
                      Valider Conformité
                    </button>
                  </Card>
                )}

                {/* STEP 3 & 4: BO TRESORERIE 1 */}
                {(currentStep === 3 || currentStep === 4) && (
                  <Card className="p-6 border-l-4 border-emerald-500">
                    <h3 className="font-bold text-lg mb-4">
                      Traitement Trésorerie (Niveau 1)
                    </h3>

                    {currentStep === 3 ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded border flex items-center justify-between">
                          <span className="text-sm font-medium">
                            1. Constatation Paiement PROLEASE
                          </span>
                          <button className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                            En Attente
                          </button>
                        </div>
                        <button
                          onClick={handleBOTreso1}
                          className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700"
                        >
                          Générer O.D. & Certif RAS
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in">
                        <div className="p-4 bg-emerald-50 rounded border border-emerald-100 flex items-center gap-3">
                          <CheckCircle size={20} className="text-emerald-600" />
                          <div>
                            <div className="text-sm font-bold text-emerald-800">
                              Ordre de Décaissement #OD-{dossier.id}
                            </div>
                            <div className="text-xs text-emerald-600">
                              Généré le {new Date().toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="bg-slate-100 p-4 rounded text-center text-sm text-slate-500 flex flex-col items-center gap-2">
                          <Scan size={24} />
                          Simulation du scan et envoi email au BO Trésorerie
                          2...
                        </div>
                        <button
                          onClick={handleBOTreso2_Prep}
                          className="w-full bg-slate-800 text-white py-3 rounded-lg font-medium hover:bg-slate-700"
                        >
                          Transférer au BO Trésorerie 2
                        </button>
                      </div>
                    )}
                  </Card>
                )}

                {/* STEP 5: BO TRESORERIE 2 */}
                {currentStep === 5 && (
                  <Card className="p-6 border-l-4 border-emerald-700">
                    <h3 className="font-bold text-lg mb-4">
                      Confection du Règlement
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <button className="p-4 border-2 border-emerald-600 bg-emerald-50 rounded-lg flex flex-col items-center gap-2 text-emerald-800">
                        <Printer size={24} />
                        <span className="font-bold">Chèque</span>
                      </button>
                      <button className="p-4 border border-slate-200 hover:bg-slate-50 rounded-lg flex flex-col items-center gap-2 text-slate-600">
                        <ArrowRight size={24} />
                        <span className="font-medium">Virement</span>
                      </button>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Numéro Chèque / Effet
                      </label>
                      <input
                        type="text"
                        defaultValue="CHQ-78945612"
                        className="w-full p-2 border rounded font-mono"
                      />
                    </div>
                    <button
                      onClick={handleManagerValidation}
                      className="w-full bg-emerald-700 text-white py-3 rounded-lg font-medium hover:bg-emerald-800"
                    >
                      Soumettre pour Validation
                    </button>
                  </Card>
                )}

                {/* STEP 6 & 7: VALIDATION & SIGNATURE */}
                {(currentStep === 6 || currentStep === 7) && (
                  <Card className="p-6 border-l-4 border-purple-600">
                    <h3 className="font-bold text-lg mb-4">
                      {currentStep === 6
                        ? "Validation Responsable"
                        : "Signature Direction"}
                    </h3>

                    <div className="bg-white border border-slate-200 p-8 rounded-lg shadow-sm mb-6 max-w-sm mx-auto relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-slate-100 px-2 py-1 text-[10px] font-mono">
                        SPECIMEN
                      </div>
                      <div className="flex justify-between items-start mb-8">
                        <div className="text-xl font-serif font-bold text-slate-800">
                          WIFAK BANK
                        </div>
                        <div className="text-sm font-mono">
                          {formatCurrency(dossier.montant)}
                        </div>
                      </div>
                      <div className="text-sm text-slate-600 mb-2">
                        Payez contre ce chèque à l'ordre de
                      </div>
                      <div className="font-bold text-lg border-b border-slate-300 pb-1 mb-6">
                        {dossier.fournisseur}
                      </div>
                      <div className="flex justify-end gap-4 mt-8">
                        {currentStep === 7 && (
                          <div className="font-script text-2xl text-blue-900 -rotate-12">
                            Signature 1
                          </div>
                        )}
                        {currentStep === 7 && (
                          <div className="font-script text-2xl text-blue-900 -rotate-6">
                            Signature 2
                          </div>
                        )}
                        {currentStep === 6 && (
                          <div className="h-8 w-32 bg-slate-100 rounded"></div>
                        )}
                      </div>
                    </div>

                    {currentStep === 6 ? (
                      <button
                        onClick={handleSignature}
                        className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700"
                      >
                        Valider & Insérer Référence PROLEASE
                      </button>
                    ) : (
                      <button
                        onClick={handleFinalRelease}
                        className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800"
                      >
                        Signer & Libérer le Règlement
                      </button>
                    )}
                  </Card>
                )}

                {/* FINAL STATE */}
                {currentStep > 7 && (
                  <Card className="p-10 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={40} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                      Règlement Effectué
                    </h2>
                    <p className="text-slate-500 mb-6">
                      Le fournisseur a été notifié et le contrat IJARA est mis
                      en force.
                    </p>
                    <button
                      onClick={() => {
                        setCurrentStep(0);
                        setDossier({ ...dossier, status: "INIT", history: [] });
                      }}
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      Nouveau Règlement
                    </button>
                  </Card>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* TAB DETAILS (Logs) */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 h-fit">
              <h3 className="font-bold mb-4">Détails Dossier</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-500">Référence</span>{" "}
                  <span className="font-mono">{dossier.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-500">Client</span>{" "}
                  <span className="font-medium">{dossier.client}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-500">Fournisseur</span>{" "}
                  <span className="font-medium">{dossier.fournisseur}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-500">Montant</span>{" "}
                  <span className="font-bold">
                    {formatCurrency(dossier.montant)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-500">Statut Actuel</span>{" "}
                  <Badge color="blue">{dossier.status}</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <History size={16} /> Historique des Actions
              </h3>
              <div className="space-y-4">
                {dossier.history.length === 0 ? (
                  <div className="text-center text-slate-400 py-8 italic">
                    Aucune action enregistrée
                  </div>
                ) : (
                  dossier.history.map((log, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 text-sm border-l-2 border-slate-200 pl-4 pb-2"
                    >
                      <div className="font-mono text-xs text-slate-400 min-w-[60px]">
                        {log.time}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">
                          {log.role}
                        </div>
                        <div className="font-semibold text-emerald-700 text-xs">
                          {log.action}
                        </div>
                        <div className="text-slate-600 mt-1">{log.detail}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
