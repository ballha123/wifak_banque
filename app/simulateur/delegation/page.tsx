"use client";
import React, { useState, useEffect } from "react";
import {
  Building2,
  Briefcase,
  TrendingUp,
  ShieldAlert,
  UserCheck,
  Landmark,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Settings,
  Info,
} from "lucide-react";

// Définition de l'interface pour le typage TypeScript
interface Level {
  id: string;
  label: string;
  limit: string;
  color: string;
  icon: React.ElementType;
  circuit: string;
}

// --- DÉFINITION DES NIVEAUX SELON NO-2026-0001 ---
const NIVEAUX: Level[] = [
  {
    id: "DA",
    label: "Directeur d'Agence (DA)",
    limit: "100 kDT",
    color: "bg-blue-600",
    icon: Building2,
    circuit: "CC DA → Analyste Risque",
  },
  {
    id: "DZ",
    label: "Directeur de Zone (DZ)",
    limit: "200 kDT",
    color: "bg-indigo-600",
    icon: Briefcase,
    circuit: "CC DA → Analyste Risque DZ",
  },
  {
    id: "CPC",
    label: "Chef Pôle Commercial (CPC)",
    limit: "300 kDT (Roulant)",
    color: "bg-emerald-600",
    icon: TrendingUp,
    circuit: "CC DA → Analyste Risque DZ → CPC",
  },
  {
    id: "CPR",
    label: "Chef Pôle Risque (CPR)",
    limit: "650 kDT",
    color: "bg-amber-600",
    icon: ShieldAlert,
    circuit: "CC DA → Analyste Risque DZ → CPC → CPR",
  },
  {
    id: "DGA",
    label: "Directeur Général Adjoint (DGA)",
    limit: "800 kDT",
    color: "bg-purple-600",
    icon: UserCheck,
    circuit: "CC DA → ... → CPR → DGA",
  },
  {
    id: "COMITE",
    label: "Comité de Financement / DG",
    limit: "> 800 kDT",
    color: "bg-slate-800",
    icon: Landmark,
    circuit: "Présidé par DGA (si < 2MD) ou DG",
  },
];

export default function SimulateurMatrice2026() {
  // État du dossier (Entrées utilisateur)
  const [inputs, setInputs] = useState({
    classeBCT: 0, // 0, 1, 2+
    anciennete: 24, // Mois d'activité
    typeMateriel: "neuf", // neuf, occasion, specifique, taxi_louage
    montant: 80, // kDT (Financement demandé)
    engagementTotal: 150, // kDT (Total engagement relation)
    apport: 25, // % (1er loyer)
    taux: 16.0, // %
    ratioCharges: 15, // % (Charges / Flux)
  });

  // Correction : Ajout des types génériques pour useState
  const [result, setResult] = useState<Level | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // --- MOTEUR DE RÈGLES (Algorithme Page 2 PDF) ---
  useEffect(() => {
    calculerDelegation();
  }, [inputs]);

  const calculerDelegation = () => {
    let reasons: string[] = [];
    let niveau = "DA"; // On commence au niveau le plus bas et on escalade

    // ---------------------------------------------------------
    // 1. TEST NIVEAU DA (Directeur Agence)
    // ---------------------------------------------------------
    // Critères stricts de la colonne 1
    const isDA_Exclusion =
      inputs.typeMateriel === "taxi_louage" ||
      inputs.typeMateriel === "specifique" ||
      inputs.typeMateriel === "occasion";

    if (inputs.classeBCT !== 0) {
      niveau = "CPC"; // Saut DZ car DZ demande aussi BCT 0
      reasons.push("Classe BCT différente de 0 (DA/DZ incompétents)");
    } else if (isDA_Exclusion) {
      niveau = "CPC"; // Saut DZ car DZ a les mêmes exclusions matérielles
      reasons.push(
        "Exclusion Matériel (Taxi/Louage/Spécifique/Occasion) pour le Réseau",
      );
    } else if (inputs.anciennete < 12) {
      niveau = "DZ"; // DA exige >= 1 an
      reasons.push("Ancienneté < 1 an (Min DA)");
    } else if (inputs.montant > 100) {
      niveau = "DZ";
      reasons.push("Montant > 100 kDT (Plafond DA)");
    } else if (inputs.engagementTotal > 200) {
      niveau = "DZ";
      reasons.push("Engagement Total > 200 kDT (Limite DA)");
    } else if (inputs.apport < 20) {
      niveau = "DZ";
      reasons.push("1er Loyer < 20% (Seuil DA)");
    } else if (inputs.taux < 15) {
      niveau = "DZ";
      reasons.push("Taux < 15% (Seuil DA)");
    } else if (inputs.ratioCharges >= 20) {
      niveau = "CPR"; // Ratio > 20% va souvent aux Risques
      reasons.push("Ratio Charges/Flux > 20%");
    }

    // ---------------------------------------------------------
    // 2. TEST NIVEAU DZ (Directeur Zone) - Si escaladé depuis DA
    // ---------------------------------------------------------
    if (niveau === "DZ") {
      const isDZ_Exclusion =
        inputs.typeMateriel === "taxi_louage" ||
        inputs.typeMateriel === "specifique" ||
        inputs.typeMateriel === "occasion";

      if (inputs.classeBCT !== 0) {
        niveau = "CPC";
        reasons.push("Classe BCT non 0 (DZ incompétent)");
      } else if (isDZ_Exclusion) {
        niveau = "CPC";
        reasons.push("Matériel exclu pour la Zone (Taxi/Occasion/Spécifique)");
      } else if (inputs.anciennete < 6) {
        niveau = "CPC"; // DZ exige >= 6 mois
        reasons.push("Ancienneté < 6 mois (Min DZ)");
      } else if (inputs.montant > 200) {
        niveau = "CPC";
        reasons.push("Montant > 200 kDT (Plafond DZ)");
      } else if (inputs.engagementTotal > 400) {
        niveau = "CPC";
        reasons.push("Engagement Total > 400 kDT (Limite DZ)");
      } else if (inputs.apport < 10) {
        niveau = "CPC";
        reasons.push("1er Loyer < 10% (Seuil DZ)");
      } else if (inputs.taux < 13.5) {
        niveau = "CPC";
        reasons.push("Taux < 13.5% (Seuil DZ)");
      } else if (inputs.ratioCharges >= 20) {
        niveau = "CPR";
        reasons.push("Ratio Charges > 20% (Vers Risques)");
      }
    }

    // ---------------------------------------------------------
    // 3. TEST NIVEAU CPC (Chef Pôle Commercial)
    // ---------------------------------------------------------
    if (niveau === "CPC") {
      // CPC gère BCT 0 et 1. Si > 1 -> CPR
      if (inputs.classeBCT > 1) {
        niveau = "CPR";
        reasons.push("Classe BCT > 1 (Hors pouvoir Commercial)");
      }
      // CPC gère Neuf et Occasion < 2 ans. Si Spécifique -> CPR
      else if (inputs.typeMateriel === "specifique") {
        niveau = "CPR";
        reasons.push("Matériel Spécifique relève du Pôle Risque");
      } else if (inputs.anciennete < 6) {
        niveau = "CPR";
        reasons.push("Ancienneté < 6 mois (Min CPC)");
      }
      // Plafond CPC Roulant = 300, BTP/Médical = 200. On simplifie sur Roulant ici.
      else if (inputs.montant > 300) {
        niveau = "CPR";
        reasons.push("Montant > 300 kDT (Plafond CPC Roulant)");
      } else if (inputs.engagementTotal > 1000) {
        niveau = "CPR";
        reasons.push("Engagement Total > 1 MD (Limite CPC)");
      } else if (inputs.taux < 12.5) {
        niveau = "CPR";
        reasons.push("Taux < 12.5% (Seuil CPC)");
      } else if (inputs.ratioCharges >= 20) {
        niveau = "CPR";
        reasons.push("Ratio Charges > 20%");
      }
    }

    // ---------------------------------------------------------
    // 4. TEST NIVEAU CPR (Chef Pôle Risque)
    // ---------------------------------------------------------
    if (niveau === "CPR") {
      // CPR gère BCT 0-1.
      if (inputs.classeBCT > 1) {
        niveau = "DGA"; // Ou Comité selon interprétation, on met DGA par sécurité
        reasons.push("Classe BCT > 1 (Escalade DGA)");
      } else if (inputs.montant > 650) {
        niveau = "DGA";
        reasons.push("Montant > 650 kDT (Plafond CPR)");
      } else if (inputs.engagementTotal > 1300) {
        niveau = "DGA";
        reasons.push("Engagement Total > 1.3 MD (Limite CPR)");
      } else if (inputs.taux < 11.5) {
        niveau = "DGA";
        reasons.push("Taux < 11.5% (Seuil CPR)");
      }
    }

    // ---------------------------------------------------------
    // 5. TEST NIVEAU DGA
    // ---------------------------------------------------------
    if (niveau === "DGA") {
      if (inputs.montant > 800) {
        niveau = "COMITE";
        reasons.push("Montant > 800 kDT (Plafond DGA)");
      } else if (inputs.engagementTotal > 1500) {
        niveau = "COMITE";
        reasons.push("Engagement Total > 1.5 MD (Limite DGA)");
      } else if (inputs.taux < 11.0) {
        niveau = "COMITE";
        reasons.push("Taux < 11% (Seuil DGA)");
      }
    }

    // Correction : Gestion du undefined si find échoue
    const found = NIVEAUX.find((n) => n.id === niveau);
    setResult(found || null);
    setLogs(reasons);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            W
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-800">
              Simulateur Délégation IJARA
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Conforme Note d'Organisation NO-2026/0001
            </p>
          </div>
        </div>
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-2">
          <Info size={14} /> Version 21-01-2026
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulaire de Saisie (Gauche) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-700">
              <Settings className="text-emerald-600" /> Critères du Dossier
            </h3>

            <div className="space-y-4">
              {/* Classe BCT */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Classe Banque Centrale (BCT)
                </label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {[0, 1, 2].map((val) => (
                    <button
                      key={val}
                      onClick={() => setInputs({ ...inputs, classeBCT: val })}
                      className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${inputs.classeBCT === val ? "bg-white shadow text-emerald-700" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      {val === 2 ? "2+" : val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Montants */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Montant (kDT)
                  </label>
                  <input
                    type="number"
                    value={inputs.montant}
                    onChange={(e) =>
                      setInputs({ ...inputs, montant: Number(e.target.value) })
                    }
                    className="w-full p-2 border border-slate-300 rounded font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Eng. Total (kDT)
                  </label>
                  <input
                    type="number"
                    value={inputs.engagementTotal}
                    onChange={(e) =>
                      setInputs({
                        ...inputs,
                        engagementTotal: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded font-mono text-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Matériel */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Type de Matériel
                </label>
                <select
                  value={inputs.typeMateriel}
                  onChange={(e) =>
                    setInputs({ ...inputs, typeMateriel: e.target.value })
                  }
                  className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="neuf">Véhicule Neuf (Standard)</option>
                  <option value="occasion">
                    Véhicule Occasion (&lt; 2 ans)
                  </option>
                  <option value="taxi_louage">
                    Taxi / Louage / Transport Rural
                  </option>
                  <option value="specifique">
                    Matériel Spécifique / Industriel
                  </option>
                </select>
              </div>

              {/* Autres Critères */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Taux (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={inputs.taux}
                    onChange={(e) =>
                      setInputs({ ...inputs, taux: Number(e.target.value) })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    1er Loyer (%)
                  </label>
                  <input
                    type="number"
                    value={inputs.apport}
                    onChange={(e) =>
                      setInputs({ ...inputs, apport: Number(e.target.value) })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Ancienneté (Mois)
                  </label>
                  <input
                    type="number"
                    value={inputs.anciennete}
                    onChange={(e) =>
                      setInputs({
                        ...inputs,
                        anciennete: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Ratio Charges (%)
                  </label>
                  <input
                    type="number"
                    value={inputs.ratioCharges}
                    onChange={(e) =>
                      setInputs({
                        ...inputs,
                        ratioCharges: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Résultat (Droite) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Carte de Décision */}
          <div
            className={`relative overflow-hidden rounded-xl shadow-lg p-8 text-white transition-all duration-500 ${result ? result.color : "bg-slate-800"}`}
          >
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div className="text-white/80 uppercase tracking-widest text-xs font-bold mb-2">
                  Pouvoir de Signature Requis
                </div>
                <div className="text-4xl font-bold mb-2">
                  {result ? result.label : "Calcul..."}
                </div>
                <div className="text-white/90 font-medium">
                  Plafond du niveau : {result ? result.limit : "-"}
                </div>
              </div>
              <div className="bg-white/20 p-4 rounded-full backdrop-blur-md">
                {result && <result.icon size={48} />}
              </div>
            </div>

            {/* Circuit de Validation */}
            <div className="mt-8 pt-6 border-t border-white/20 relative z-10">
              <div className="text-xs font-bold uppercase opacity-80 mb-2">
                Circuit de Validation (Workflow)
              </div>
              <div className="flex items-center gap-2 font-mono text-sm bg-black/20 p-3 rounded-lg w-fit">
                <ArrowRight size={16} /> {result ? result.circuit : "..."}
              </div>
            </div>

            {/* Décoration d'arrière-plan */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Analyse des Raisons (Pourquoi ce niveau ?) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" /> Analyse de l'Escalade
            </h4>

            {logs.length > 0 ? (
              <ul className="space-y-3">
                {logs.map((log, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm text-slate-600 bg-amber-50 p-3 rounded-lg border border-amber-100"
                  >
                    <ArrowRight
                      size={16}
                      className="text-amber-500 mt-0.5 shrink-0"
                    />
                    <span>{log}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                <CheckCircle size={20} />
                <span className="font-medium">
                  Le dossier respecte tous les critères standards de ce niveau.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
