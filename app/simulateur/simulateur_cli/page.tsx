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
  Globe,
  RefreshCw,
  Scan,
  Printer,
  PenTool,
  Send,
  History,
  ShieldCheck,
  Mail,
  Lock,
  Coins,
  LucideIcon,
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

// --- DONNÉES DE REFERENCE (Basé sur V2.0) ---
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

// Helper type for the keys of ROLES
type RoleKey = keyof typeof ROLES;

export default function LCIProcessSimulator() {
  // État du dossier LCI
  // Explicitly typing useState allows 'history' to accept objects later, preventing the 'never[]' error
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

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("simulation");
  const [loading, setLoading] = useState<boolean>(false);
  const [draftFeedback, setDraftFeedback] = useState<string>("ok"); // ok, modif

  // Fonction Log
  const logAction = (role: RoleKey, action: string, detail: string) => {
    const newLog: HistoryLog = {
      time: new Date().toLocaleTimeString(),
      role: ROLES[role].label,
      action,
      detail,
    };
    setDossier((prev) => ({ ...prev, history: [newLog, ...prev.history] }));
  };

  // --- WORKFLOW ACTIONS ---

  // 1. Création Compte Fournisseur (MO/BO IJARA)
  const handleSupplierSetup = () => {
    setLoading(true);
    setTimeout(() => {
      logAction("AGENCE", "Demande", "Envoi CIF Fournisseur");
      logAction("MO_IJARA", "Saisie", "Création Compte Fournisseur sur iMal");
      logAction("BO_IJARA", "Validation", "Validation Compte (GL 364101)");
      setCurrentStep(1);
      setLoading(false);
    }, 1500);
  };

  // 2. Notification Risque (Responsable Risque)
  const handleRiskValidation = () => {
    setLoading(true);
    setTimeout(() => {
      logAction(
        "RISQUE",
        "Contrôle",
        "Vérification NCG, Avis Blocage, Documents 1ère partie",
      );
      logAction(
        "RISQUE",
        "Émission",
        "Notification d'ouverture de la LCI signée",
      );
      setCurrentStep(2);
      setLoading(false);
    }, 1500);
  };

  // 3. Transmission au Trade (Agence -> MO Trade)
  const handleTransferTrade = () => {
    setLoading(true);
    setTimeout(() => {
      logAction("AGENCE", "Envoi", "Transmission dossier au MO Trade");
      logAction(
        "MO_TRADE",
        "Réception",
        "Vérification cohérence documents & couverture",
      );
      setCurrentStep(3);
      setLoading(false);
    }, 1500);
  };

  // 4. Gestion du Draft SWIFT (Cycle Trade <-> Agence)
  const handleSwiftDraft = () => {
    setLoading(true);
    setTimeout(() => {
      if (draftFeedback === "modif") {
        logAction(
          "CH_COMEX",
          "Draft MT700",
          "Envoi brouillon pour validation client",
        );
        logAction("AGENCE", "Retour Client", "Demande de modification reçue");
        logAction(
          "MO_TRADE",
          "Correction",
          "Soumission modifications au Comex",
        );
        alert("Modifications intégrées. Le client doit revalider.");
        setDraftFeedback("ok"); // On suppose qu'après modif c'est bon
      } else {
        logAction(
          "CH_COMEX",
          "Draft MT700",
          "Envoi brouillon pour validation client",
        );
        logAction(
          "AGENCE",
          "Validation",
          "Draft confirmé et signé par le client",
        );
        setCurrentStep(4);
      }
      setLoading(false);
    }, 2000);
  };

  // 5. Émission SWIFT MT700 (Comex)
  const handleSwiftEmission = () => {
    setLoading(true);
    setTimeout(() => {
      logAction(
        "CH_COMEX",
        "Émission",
        "Saisie MT700 sur iMal & Plateforme SWIFT",
      );
      logAction("RESP_COMEX", "Validation", "Validation finale du MT700");
      logAction("CH_COMEX", "Communication", "Envoi copie SWIFT à l'agence");
      setCurrentStep(5);
      setLoading(false);
    }, 2000);
  };

  // 6. Réception & Paiement (Closing)
  const handleClosing = (rate: string) => {
    setLoading(true);
    const numRate = parseFloat(rate);
    setTimeout(() => {
      setDossier((prev) => ({ ...prev, coursChange: numRate }));
      logAction("CH_COMEX", "Réception", "Documents conformes / MT754 reçus");
      logAction("AGENCE", "Négociation", `Cours de change fixé à ${rate}`);
      logAction(
        "AGENCE",
        "Mise à jour",
        "Actualisation Base Locative PROLEASE",
      );
      setCurrentStep(6);
      setLoading(false);
    }, 2000);
  };

  const formatCurrency = (val: number, cur: string) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: cur }).format(
      val,
    );

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
                Règlement IJARA Import (LCI)
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Procédure IJA-MEPMI-02 V2.0
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("simulation")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === "simulation" ? "bg-sky-50 text-sky-700" : "text-slate-500 hover:bg-slate-100"}`}
            >
              Simulateur
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === "details" ? "bg-sky-50 text-sky-700" : "text-slate-500 hover:bg-slate-100"}`}
            >
              Détails LCI
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "simulation" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT: WORKFLOW TRACKER */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="p-0 overflow-hidden sticky top-24">
                <div className="bg-slate-900 text-white p-4 border-b border-slate-800">
                  <h3 className="font-bold flex items-center gap-2">
                    <History size={18} /> Workflow Import
                  </h3>
                </div>
                <div className="p-4 space-y-6">
                  {[
                    { label: "Création Compte Fournisseur", role: "BO_IJARA" },
                    { label: "Validation Risque (Notif LCI)", role: "RISQUE" },
                    { label: "Transfert au Trade Finance", role: "MO_TRADE" },
                    { label: "Draft SWIFT & Validation", role: "CH_COMEX" },
                    { label: "Émission MT700", role: "RESP_COMEX" },
                    { label: "Réception & Change", role: "AGENCE" },
                    { label: "Finalisation", role: "AGENCE" },
                  ].map((step, idx) => (
                    <div key={idx} className="relative pl-8">
                      {idx < 6 && (
                        <div
                          className={`absolute left-[11px] top-6 bottom-[-24px] w-0.5 ${idx < currentStep ? "bg-sky-500" : "bg-slate-200"}`}
                        ></div>
                      )}
                      <div
                        className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold z-10 ${idx < currentStep ? "bg-sky-500 border-sky-500 text-white" : idx === currentStep ? "bg-white border-blue-500 text-blue-500 animate-pulse" : "bg-white border-slate-300 text-slate-300"}`}
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

            {/* RIGHT: INTERACTIVE AREA */}
            <div className="lg:col-span-8">
              {/* STATUS BANNER */}
              <div className="mb-6 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-800 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      {currentStep <= 1 ? (
                        <ShieldCheck />
                      ) : currentStep <= 3 ? (
                        <Scan />
                      ) : (
                        <Globe />
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase font-semibold">
                        Étape en cours
                      </div>
                      <div className="font-bold text-lg">
                        {currentStep === 0 && "Initialisation & Fournisseur"}
                        {currentStep === 1 && "Contrôle Risque & Engagement"}
                        {currentStep === 2 && "Vérification Trade Finance"}
                        {currentStep === 3 && "Gestion du Draft SWIFT"}
                        {currentStep === 4 && "Émission MT700"}
                        {currentStep === 5 && "Réalisation & Paiement"}
                        {currentStep === 6 && "Dossier Clôturé"}
                      </div>
                    </div>
                  </div>
                  {loading && (
                    <div className="flex items-center gap-2 text-sm text-sky-400 animate-pulse">
                      <RefreshCw className="animate-spin" size={16} />{" "}
                      Traitement...
                    </div>
                  )}
                </div>
              </div>

              {/* STEPS CONTENT */}
              <div className="space-y-6">
                {/* STEP 0: SUPPLIER */}
                {currentStep === 0 && (
                  <Card className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Building2 className="text-sky-600" /> Configuration
                      Fournisseur
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="text-xs font-semibold text-slate-500">
                          Fournisseur Étranger
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
                        <label className="text-xs font-semibold text-slate-500">
                          Devise LCI
                        </label>
                        <select
                          value={dossier.devise}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                            setDossier({ ...dossier, devise: e.target.value })
                          }
                          className="w-full p-2 border rounded text-sm"
                        >
                          <option>EUR</option>
                          <option>USD</option>
                          <option>GBP</option>
                        </select>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-6 text-sm text-blue-800">
                      <p>
                        Le compte fournisseur doit être créé sur{" "}
                        <strong>iMal</strong> avant toute opération. Le GL
                        comptable associé est le <strong>364101</strong>.
                      </p>
                    </div>
                    <button
                      onClick={handleSupplierSetup}
                      disabled={loading}
                      className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 flex justify-center gap-2"
                    >
                      Créer Compte & Valider <ArrowRight size={18} />
                    </button>
                  </Card>
                )}

                {/* STEP 1: RISK */}
                {currentStep === 1 && (
                  <Card className="p-6 border-l-4 border-red-500">
                    <h3 className="font-bold text-lg mb-4">
                      Validation Pôle Risque
                    </h3>
                    <div className="space-y-3 mb-6">
                      {[
                        "Demande Ouverture LCI",
                        "Contrat IJARA 1ère Partie",
                        "Avis de Blocage (Frais/Loyer)",
                        "Facture Proforma",
                      ].map((doc) => (
                        <div
                          key={doc}
                          className="flex justify-between items-center p-2 bg-slate-50 border rounded"
                        >
                          <span className="text-sm">{doc}</span>
                          <CheckCircle size={16} className="text-emerald-500" />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleRiskValidation}
                      className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700"
                    >
                      Générer Notification Ouverture LCI
                    </button>
                  </Card>
                )}

                {/* STEP 2: TRADE TRANSFER */}
                {currentStep === 2 && (
                  <Card className="p-6 border-l-4 border-cyan-500">
                    <h3 className="font-bold text-lg mb-4">
                      Guichet Trade Finance
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Transmission du dossier physique validé par les Risques au
                      Middle Office Trade pour vérification de la cohérence.
                    </p>
                    <div className="flex items-center gap-4 bg-cyan-50 p-4 rounded-lg mb-6">
                      <Mail size={24} className="text-cyan-700" />
                      <div className="text-sm">
                        <span className="block font-bold text-cyan-900">
                          Destinataire :
                        </span>
                        Commerce.Exterieur@wifakbank.com
                      </div>
                    </div>
                    <button
                      onClick={handleTransferTrade}
                      className="w-full bg-cyan-600 text-white py-3 rounded-lg font-medium hover:bg-cyan-700"
                    >
                      Vérifier Cohérence & Transmettre
                    </button>
                  </Card>
                )}

                {/* STEP 3: SWIFT DRAFT */}
                {currentStep === 3 && (
                  <Card className="p-6 border-l-4 border-sky-600">
                    <h3 className="font-bold text-lg mb-4">
                      Gestion du Draft SWIFT (MT700)
                    </h3>
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">
                          Réponse Client sur le Draft
                        </label>
                        <span className="text-xs text-slate-500">
                          Simulation retour client
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <label
                          className={`flex-1 p-3 border rounded cursor-pointer ${draftFeedback === "ok" ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500" : "hover:bg-slate-50"}`}
                        >
                          <input
                            type="radio"
                            name="fb"
                            checked={draftFeedback === "ok"}
                            onChange={() => setDraftFeedback("ok")}
                            className="hidden"
                          />
                          <div className="font-bold text-emerald-700 text-center">
                            Validé (Conforme)
                          </div>
                        </label>
                        <label
                          className={`flex-1 p-3 border rounded cursor-pointer ${draftFeedback === "modif" ? "bg-amber-50 border-amber-500 ring-1 ring-amber-500" : "hover:bg-slate-50"}`}
                        >
                          <input
                            type="radio"
                            name="fb"
                            checked={draftFeedback === "modif"}
                            onChange={() => setDraftFeedback("modif")}
                            className="hidden"
                          />
                          <div className="font-bold text-amber-700 text-center">
                            Modifications Requises
                          </div>
                        </label>
                      </div>
                    </div>
                    <button
                      onClick={handleSwiftDraft}
                      className="w-full bg-sky-600 text-white py-3 rounded-lg font-medium hover:bg-sky-700"
                    >
                      Traiter le retour Draft
                    </button>
                  </Card>
                )}

                {/* STEP 4: EMISSION */}
                {currentStep === 4 && (
                  <Card className="p-6 border-l-4 border-sky-800">
                    <h3 className="font-bold text-lg mb-4">
                      Émission SWIFT MT700
                    </h3>
                    <div className="bg-slate-900 text-green-400 font-mono text-xs p-4 rounded mb-6 overflow-x-auto">
                      <p>:700:</p>
                      <p>:27:1/1</p>
                      <p>:40A:IRREVOCABLE</p>
                      <p>:20:{dossier.ref}</p>
                      <p>
                        :31C:
                        {new Date()
                          .toISOString()
                          .split("T")[0]
                          .replace(/-/g, "")
                          .slice(2)}
                      </p>
                      <p>:50:{dossier.client.toUpperCase()}</p>
                      <p>:59:{dossier.fournisseur.toUpperCase()}</p>
                      <p>
                        :32B:{dossier.devise}
                        {dossier.montant}
                      </p>
                      <p className="animate-pulse">_ _ _ TRANSMITTING _ _ _</p>
                    </div>
                    <button
                      onClick={handleSwiftEmission}
                      className="w-full bg-sky-800 text-white py-3 rounded-lg font-medium hover:bg-sky-900"
                    >
                      Valider & Émettre
                    </button>
                  </Card>
                )}

                {/* STEP 5: CLOSING */}
                {currentStep === 5 && (
                  <Card className="p-6 border-l-4 border-emerald-500">
                    <h3 className="font-bold text-lg mb-4">
                      Réception & Change
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Documents conformes reçus. Négociation du cours de change
                      pour règlement.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-slate-50 rounded border">
                        <div className="text-xs text-slate-500">
                          Montant Devise
                        </div>
                        <div className="font-mono font-bold text-lg">
                          {formatCurrency(dossier.montant, dossier.devise)}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500">
                          Cours Négocié (TND)
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          defaultValue="3.350"
                          id="rateInput"
                          className="w-full p-2 border rounded font-mono font-bold text-right"
                        />
                      </div>
                    </div>

                    <div className="bg-emerald-50 p-3 rounded text-sm text-emerald-800 flex gap-2 mb-6">
                      <Coins size={18} />
                      Actualisation automatique de la Base Locative sur PROLEASE
                      après validation.
                    </div>

                    <button
                      onClick={() => {
                        const rateInput = document.getElementById(
                          "rateInput",
                        ) as HTMLInputElement;
                        if (rateInput) handleClosing(rateInput.value);
                      }}
                      className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700"
                    >
                      Confirmer Change & Clôturer
                    </button>
                  </Card>
                )}

                {/* STEP 6: FINISH */}
                {currentStep === 6 && (
                  <Card className="p-10 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={40} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                      Processus LCI Terminé
                    </h2>
                    <p className="text-slate-500 mb-6">
                      Le fournisseur a été payé, la marchandise est en route
                      (CIF) et le contrat IJARA est à jour.
                    </p>
                    <div className="inline-block px-4 py-2 bg-slate-100 rounded-lg font-mono text-sm mb-6">
                      Montant Final:{" "}
                      {formatCurrency(
                        dossier.montant * (dossier.coursChange || 0),
                        "TND",
                      )}
                    </div>
                    <br />
                    <button
                      onClick={() => {
                        setCurrentStep(0);
                        setDossier({ ...dossier, history: [] });
                      }}
                      className="text-sky-600 font-bold hover:underline"
                    >
                      Nouvelle LCI
                    </button>
                  </Card>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* TAB DETAILS */
          <div className="grid grid-cols-1 gap-6">
            <Card className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <History size={16} /> Logs du Dossier {dossier.ref}
              </h3>
              <div className="space-y-0">
                {dossier.history.length === 0 ? (
                  <div className="text-slate-400 italic py-4">
                    Aucune activité
                  </div>
                ) : (
                  dossier.history.map((log, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 text-sm border-l-2 border-slate-200 pl-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="font-mono text-xs text-slate-400 min-w-[60px] pt-1">
                        {log.time}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">
                            {log.role}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-1 rounded">
                            {log.action}
                          </span>
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
